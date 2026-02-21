import {
  TransferEstimateRequest,
  TransferEstimateRules,
  TransferEstimateBreakdown,
} from './transfer-estimate.types';
import { cloneTransferEstimateRules, defaultTransferEstimateRules } from './transfer-estimate.rules';

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const mergeRules = (custom?: Partial<TransferEstimateRules>): TransferEstimateRules => {
  if (!custom) return cloneTransferEstimateRules(defaultTransferEstimateRules);

  return {
    ...defaultTransferEstimateRules,
    ...custom,
    perKmByTier: {
      ...defaultTransferEstimateRules.perKmByTier,
      ...(custom.perKmByTier || {}),
    },
    demandMultiplier: {
      ...defaultTransferEstimateRules.demandMultiplier,
      ...(custom.demandMultiplier || {}),
    },
    tollFlatByBand: {
      ...defaultTransferEstimateRules.tollFlatByBand,
      ...(custom.tollFlatByBand || {}),
    },
    couponDiscountByCode: {
      ...defaultTransferEstimateRules.couponDiscountByCode,
      ...(custom.couponDiscountByCode || {}),
    },
  };
};

const couponDiscount = (
  subtotal: number,
  code: string | undefined,
  rules: TransferEstimateRules
): { appliedCoupon?: string; amount: number } => {
  if (!code) return { amount: 0 };
  const percent = rules.couponDiscountByCode[code] || 0;
  if (percent <= 0) return { amount: 0 };
  return { appliedCoupon: code, amount: subtotal * percent };
};

export const calculateTransferEstimateBreakdown = (
  request: TransferEstimateRequest,
  customRules?: Partial<TransferEstimateRules>
): { breakdown: TransferEstimateBreakdown; appliedCoupon?: string } => {
  const rules = mergeRules(customRules);

  const baseDistanceCost = round2((rules.perKmByTier[request.tier] || 0) * request.distanceKm);
  const demandAdjustment = round2(baseDistanceCost * ((rules.demandMultiplier[request.demandBand] || 1) - 1));
  const passengerSurcharge = round2(Math.max(0, request.passengers - 1) * rules.passengerSurchargePerHead);
  const luggageSurcharge = round2(request.luggageUnits * rules.luggageSurchargePerUnit);

  const tollCost = request.includeToll ? round2(rules.tollFlatByBand[request.demandBand] || 0) : 0;
  const parkingCost = request.includeParking ? round2(rules.parkingFlat) : 0;

  const preMarkup = round2(baseDistanceCost + demandAdjustment + passengerSurcharge + luggageSurcharge + tollCost + parkingCost);
  const markup = Math.max(0, Math.min(request.markupPercent || 0, rules.maxMarkupPercent));
  const markupAmount = round2(preMarkup * (markup / 100));

  const subtotal = round2(preMarkup + markupAmount);
  const discountInfo = couponDiscount(subtotal, request.couponCode, rules);
  const discount = round2(Math.min(subtotal, discountInfo.amount));

  const chargeBase = round2(Math.max(0, subtotal - discount));
  const serviceCharge = round2(chargeBase * rules.serviceChargePercent);
  const total = round2(chargeBase + serviceCharge);

  return {
    appliedCoupon: discountInfo.appliedCoupon,
    breakdown: {
      baseDistanceCost,
      demandAdjustment,
      passengerSurcharge,
      luggageSurcharge,
      tollCost,
      parkingCost,
      markupAmount,
      subtotal,
      discount,
      serviceCharge,
      total,
    },
  };
};
