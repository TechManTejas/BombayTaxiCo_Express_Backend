import { FareBreakdown, FareQuoteRequest, FareRuleSet } from './fare-quote.types';

export const defaultFareRuleSet: FareRuleSet = {
  baseKmRate: 18,
  roundTripMultiplier: 1.75,
  hourlyRate: 320,
  minimumFare: 450,
  nightChargePercent: 0.2,
  nightWindowStartHour: 22,
  nightWindowEndHour: 5,
  surgeMultiplier: 1.0,
  bagChargePerUnit: 40,
  couponPercentByCode: {
    WELCOME10: 0.1,
    SAVE15: 0.15,
    NIGHT5: 0.05,
  },
  serviceTaxPercent: 0.05,
};

const toFixed2 = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const parseHour = (time: string): number => {
  return parseInt(time.split(':')[0], 10);
};

export const isNightWindow = (pickupTime: string, rules: FareRuleSet): boolean => {
  const hour = parseHour(pickupTime);
  if (Number.isNaN(hour)) return false;

  if (rules.nightWindowStartHour > rules.nightWindowEndHour) {
    return hour >= rules.nightWindowStartHour || hour < rules.nightWindowEndHour;
  }

  return hour >= rules.nightWindowStartHour && hour < rules.nightWindowEndHour;
};

const distanceFare = (request: FareQuoteRequest, rules: FareRuleSet): number => {
  const distance = request.distanceKm || 0;
  const base = distance * rules.baseKmRate;

  if (request.tripType === 'Round Trip') {
    return base * rules.roundTripMultiplier;
  }

  return base;
};

const hourlyFare = (request: FareQuoteRequest, rules: FareRuleSet): number => {
  const durationHours = request.durationHours || 0;
  return durationHours * rules.hourlyRate;
};

const couponDiscount = (subtotal: number, couponCode: string | undefined, rules: FareRuleSet): { code?: string; discount: number } => {
  if (!couponCode) {
    return { discount: 0 };
  }

  const percent = rules.couponPercentByCode[couponCode] || 0;
  if (percent <= 0) {
    return { discount: 0 };
  }

  return {
    code: couponCode,
    discount: subtotal * percent,
  };
};

export const calculateFareBreakdown = (
  request: FareQuoteRequest,
  customRules?: Partial<FareRuleSet>
): { breakdown: FareBreakdown; appliedCoupon?: string } => {
  const rules: FareRuleSet = {
    ...defaultFareRuleSet,
    ...customRules,
    couponPercentByCode: {
      ...defaultFareRuleSet.couponPercentByCode,
      ...(customRules?.couponPercentByCode || {}),
    },
  };

  const computedBaseFare = request.tripType === 'Hourly Rental'
    ? hourlyFare(request, rules)
    : distanceFare(request, rules);

  const baseFare = Math.max(computedBaseFare, rules.minimumFare);
  const tripAdjustment = toFixed2(baseFare - computedBaseFare);

  const bagSurcharge = toFixed2(request.largeBags * rules.bagChargePerUnit);
  const nightCharge = isNightWindow(request.pickupTime, rules)
    ? toFixed2((baseFare + bagSurcharge) * rules.nightChargePercent)
    : 0;

  const surgeCharge = toFixed2((baseFare + bagSurcharge + nightCharge) * (rules.surgeMultiplier - 1));
  const subtotal = toFixed2(baseFare + bagSurcharge + nightCharge + surgeCharge);

  const discountInfo = couponDiscount(subtotal, request.couponCode, rules);
  const discount = toFixed2(Math.min(discountInfo.discount, subtotal));

  const taxableAmount = toFixed2(Math.max(0, subtotal - discount));
  const serviceTax = toFixed2(taxableAmount * rules.serviceTaxPercent);
  const total = toFixed2(taxableAmount + serviceTax);

  return {
    appliedCoupon: discountInfo.code,
    breakdown: {
      baseFare: toFixed2(baseFare),
      bagSurcharge,
      tripAdjustment,
      nightCharge,
      surgeCharge,
      subtotal,
      discount,
      taxableAmount,
      serviceTax,
      total,
    },
  };
};
