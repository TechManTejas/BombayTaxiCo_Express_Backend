import {
  AirportAddonQuoteBreakdown,
  AirportAddonQuoteRequest,
  AirportAddonQuoteRules,
} from './airport-addon-quote.types';
import {
  cloneAirportAddonQuoteRules,
  defaultAirportAddonQuoteRules,
} from './airport-addon-quote.rules';

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const mergeRules = (custom?: Partial<AirportAddonQuoteRules>): AirportAddonQuoteRules => {
  if (!custom) return cloneAirportAddonQuoteRules(defaultAirportAddonQuoteRules);

  return {
    ...defaultAirportAddonQuoteRules,
    ...custom,
    basePerTrip: {
      ...defaultAirportAddonQuoteRules.basePerTrip,
      ...(custom.basePerTrip || {}),
    },
    timeBandMultiplier: {
      ...defaultAirportAddonQuoteRules.timeBandMultiplier,
      ...(custom.timeBandMultiplier || {}),
    },
    couponDiscountPercent: {
      ...defaultAirportAddonQuoteRules.couponDiscountPercent,
      ...(custom.couponDiscountPercent || {}),
    },
  };
};

const couponDiscount = (
  subtotal: number,
  code: string | undefined,
  rules: AirportAddonQuoteRules
): { appliedCoupon?: string; amount: number } => {
  if (!code) return { amount: 0 };
  const percent = rules.couponDiscountPercent[code] || 0;
  if (percent <= 0) return { amount: 0 };
  return { appliedCoupon: code, amount: subtotal * percent };
};

export const calculateAirportAddonQuoteBreakdown = (
  request: AirportAddonQuoteRequest,
  customRules?: Partial<AirportAddonQuoteRules>
): { breakdown: AirportAddonQuoteBreakdown; appliedCoupon?: string } => {
  const rules = mergeRules(customRules);

  const basePerTrip = rules.basePerTrip[request.addonTier] || 0;
  const timeFactor = rules.timeBandMultiplier[request.timeBand] || 1;

  const baseTripCost = round2(basePerTrip * request.trips);
  const timeBandAdjustment = round2(baseTripCost * (timeFactor - 1));

  const extraPassengers = Math.max(0, request.passengers - 2);
  const passengerAdjustment = round2(extraPassengers * request.trips * rules.perPassengerAfterTwo);

  const meetAndGreetCost = request.includeMeetAndGreet ? round2(request.trips * rules.meetAndGreetPerTrip) : 0;
  const fastTrackCost = request.includeFastTrack
    ? round2(request.passengers * request.trips * rules.fastTrackPerPassenger)
    : 0;
  const prioritySupportCost = request.includePrioritySupport ? round2(rules.prioritySupportFlat) : 0;

  const beforeMarkup = round2(
    baseTripCost +
      timeBandAdjustment +
      passengerAdjustment +
      meetAndGreetCost +
      fastTrackCost +
      prioritySupportCost
  );

  const markupPercent = Math.max(0, Math.min(request.markupPercent || 0, rules.maxMarkupPercent));
  const markupAmount = round2(beforeMarkup * (markupPercent / 100));

  const subtotal = round2(beforeMarkup + markupAmount);
  const discountInfo = couponDiscount(subtotal, request.couponCode, rules);
  const discount = round2(Math.min(discountInfo.amount, subtotal));

  const feeBase = round2(Math.max(0, subtotal - discount));
  const convenienceFee = round2(feeBase * rules.convenienceFeePercent);
  const total = round2(feeBase + convenienceFee);

  return {
    appliedCoupon: discountInfo.appliedCoupon,
    breakdown: {
      baseTripCost,
      timeBandAdjustment,
      passengerAdjustment,
      meetAndGreetCost,
      fastTrackCost,
      prioritySupportCost,
      markupAmount,
      subtotal,
      discount,
      convenienceFee,
      total,
    },
  };
};
