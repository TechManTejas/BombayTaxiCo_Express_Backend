import {
  IntercityAddonQuoteBreakdown,
  IntercityAddonQuoteRequest,
  IntercityAddonQuoteRules,
} from './intercity-addon-quote.types';
import {
  cloneIntercityAddonQuoteRules,
  defaultIntercityAddonQuoteRules,
} from './intercity-addon-quote.rules';

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const mergeRules = (custom?: Partial<IntercityAddonQuoteRules>): IntercityAddonQuoteRules => {
  if (!custom) return cloneIntercityAddonQuoteRules(defaultIntercityAddonQuoteRules);

  return {
    ...defaultIntercityAddonQuoteRules,
    ...custom,
    basePerTrip: {
      ...defaultIntercityAddonQuoteRules.basePerTrip,
      ...(custom.basePerTrip || {}),
    },
    routeMultiplier: {
      ...defaultIntercityAddonQuoteRules.routeMultiplier,
      ...(custom.routeMultiplier || {}),
    },
    couponDiscountPercent: {
      ...defaultIntercityAddonQuoteRules.couponDiscountPercent,
      ...(custom.couponDiscountPercent || {}),
    },
  };
};

const couponDiscount = (
  subtotal: number,
  code: string | undefined,
  rules: IntercityAddonQuoteRules
): { appliedCoupon?: string; amount: number } => {
  if (!code) return { amount: 0 };
  const percent = rules.couponDiscountPercent[code] || 0;
  if (percent <= 0) return { amount: 0 };
  return { appliedCoupon: code, amount: subtotal * percent };
};

export const calculateIntercityAddonQuoteBreakdown = (
  request: IntercityAddonQuoteRequest,
  customRules?: Partial<IntercityAddonQuoteRules>
): { breakdown: IntercityAddonQuoteBreakdown; appliedCoupon?: string } => {
  const rules = mergeRules(customRules);

  const basePerTrip = rules.basePerTrip[request.addonPlan] || 0;
  const routeFactor = rules.routeMultiplier[request.routeBand] || 1;

  const baseCost = round2(basePerTrip * request.trips);
  const routeAdjustment = round2(baseCost * (routeFactor - 1));

  const extraPassengers = Math.max(0, request.passengers - 2);
  const passengerAdjustment = round2(extraPassengers * request.trips * rules.perPassengerAfterTwo);

  const snackKitCost = request.includeSnackKit
    ? round2(request.passengers * request.trips * rules.snackKitPerPassengerPerTrip)
    : 0;
  const travelAssistantCost = request.includeTravelAssistant
    ? round2(request.trips * rules.travelAssistantPerTrip)
    : 0;
  const luggagePriorityCost = request.includeLuggagePriority
    ? round2(request.trips * rules.luggagePriorityPerTrip)
    : 0;

  const preMarkup = round2(
    baseCost +
      routeAdjustment +
      passengerAdjustment +
      snackKitCost +
      travelAssistantCost +
      luggagePriorityCost
  );

  const markupPercent = Math.max(0, Math.min(request.markupPercent || 0, rules.maxMarkupPercent));
  const markupAmount = round2(preMarkup * (markupPercent / 100));

  const subtotal = round2(preMarkup + markupAmount);
  const discountInfo = couponDiscount(subtotal, request.couponCode, rules);
  const discount = round2(Math.min(discountInfo.amount, subtotal));

  const feeBase = round2(Math.max(0, subtotal - discount));
  const serviceFee = round2(feeBase * rules.serviceFeePercent);
  const total = round2(feeBase + serviceFee);

  return {
    appliedCoupon: discountInfo.appliedCoupon,
    breakdown: {
      baseCost,
      routeAdjustment,
      passengerAdjustment,
      snackKitCost,
      travelAssistantCost,
      luggagePriorityCost,
      markupAmount,
      subtotal,
      discount,
      serviceFee,
      total,
    },
  };
};
