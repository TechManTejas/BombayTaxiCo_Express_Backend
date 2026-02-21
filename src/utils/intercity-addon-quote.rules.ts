import { IntercityAddonQuoteRules } from './intercity-addon-quote.types';

export const defaultIntercityAddonQuoteRules: IntercityAddonQuoteRules = {
  basePerTrip: {
    Saver: 1600,
    Flexi: 2400,
    Elite: 3400,
  },
  routeMultiplier: {
    SHORT: 1,
    MEDIUM: 1.18,
    LONG: 1.35,
  },
  perPassengerAfterTwo: 140,
  snackKitPerPassengerPerTrip: 110,
  travelAssistantPerTrip: 450,
  luggagePriorityPerTrip: 280,
  couponDiscountPercent: {
    TRIP5: 0.05,
    ROAD7: 0.07,
    ELITE9: 0.09,
  },
  maxMarkupPercent: 23,
  serviceFeePercent: 0.025,
};

export const cloneIntercityAddonQuoteRules = (
  rules: IntercityAddonQuoteRules
): IntercityAddonQuoteRules => ({
  ...rules,
  basePerTrip: { ...rules.basePerTrip },
  routeMultiplier: { ...rules.routeMultiplier },
  couponDiscountPercent: { ...rules.couponDiscountPercent },
});
