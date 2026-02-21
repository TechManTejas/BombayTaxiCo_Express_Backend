import { AirportAddonQuoteRules } from './airport-addon-quote.types';

export const defaultAirportAddonQuoteRules: AirportAddonQuoteRules = {
  basePerTrip: {
    Basic: 900,
    Comfort: 1400,
    Premium: 2100,
  },
  timeBandMultiplier: {
    DAY: 1,
    EVENING: 1.1,
    NIGHT: 1.2,
  },
  perPassengerAfterTwo: 120,
  meetAndGreetPerTrip: 300,
  fastTrackPerPassenger: 180,
  prioritySupportFlat: 450,
  couponDiscountPercent: {
    RIDE5: 0.05,
    AIR8: 0.08,
    PRIOR10: 0.1,
  },
  maxMarkupPercent: 22,
  convenienceFeePercent: 0.025,
};

export const cloneAirportAddonQuoteRules = (
  rules: AirportAddonQuoteRules
): AirportAddonQuoteRules => ({
  ...rules,
  basePerTrip: { ...rules.basePerTrip },
  timeBandMultiplier: { ...rules.timeBandMultiplier },
  couponDiscountPercent: { ...rules.couponDiscountPercent },
});
