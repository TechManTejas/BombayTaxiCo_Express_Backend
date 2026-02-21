export type AddonPlan = 'Saver' | 'Flexi' | 'Elite';
export type RouteBand = 'SHORT' | 'MEDIUM' | 'LONG';

export interface IntercityAddonQuoteRequest {
  pickupCity: string;
  addonPlan: AddonPlan;
  routeBand: RouteBand;
  trips: number;
  passengers: number;
  includeSnackKit: boolean;
  includeTravelAssistant: boolean;
  includeLuggagePriority: boolean;
  markupPercent?: number;
  couponCode?: string;
}

export interface IntercityAddonQuoteBreakdown {
  baseCost: number;
  routeAdjustment: number;
  passengerAdjustment: number;
  snackKitCost: number;
  travelAssistantCost: number;
  luggagePriorityCost: number;
  markupAmount: number;
  subtotal: number;
  discount: number;
  serviceFee: number;
  total: number;
}

export interface IntercityAddonQuoteResponse {
  quoteId: string;
  generatedAt: string;
  currency: 'INR';
  request: IntercityAddonQuoteRequest;
  breakdown: IntercityAddonQuoteBreakdown;
  appliedCoupon?: string;
}

export interface IntercityAddonQuoteRules {
  basePerTrip: Record<AddonPlan, number>;
  routeMultiplier: Record<RouteBand, number>;
  perPassengerAfterTwo: number;
  snackKitPerPassengerPerTrip: number;
  travelAssistantPerTrip: number;
  luggagePriorityPerTrip: number;
  couponDiscountPercent: Record<string, number>;
  maxMarkupPercent: number;
  serviceFeePercent: number;
}

export interface IntercityAddonValidationResult {
  valid: boolean;
  errors: string[];
}
