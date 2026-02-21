import { TransferEstimateRules } from './transfer-estimate.types';

export const defaultTransferEstimateRules: TransferEstimateRules = {
  perKmByTier: {
    Economy: 18,
    Comfort: 24,
    Premium: 34,
  },
  demandMultiplier: {
    High: 1.22,
    Normal: 1,
    Low: 0.9,
  },
  passengerSurchargePerHead: 120,
  luggageSurchargePerUnit: 70,
  tollFlatByBand: {
    High: 700,
    Normal: 500,
    Low: 350,
  },
  parkingFlat: 220,
  serviceChargePercent: 0.03,
  maxMarkupPercent: 25,
  couponDiscountByCode: {
    RIDE5: 0.05,
    SAVE8: 0.08,
    PREMIUM10: 0.1,
  },
};

export const cloneTransferEstimateRules = (rules: TransferEstimateRules): TransferEstimateRules => ({
  ...rules,
  perKmByTier: { ...rules.perKmByTier },
  demandMultiplier: { ...rules.demandMultiplier },
  tollFlatByBand: { ...rules.tollFlatByBand },
  couponDiscountByCode: { ...rules.couponDiscountByCode },
});
