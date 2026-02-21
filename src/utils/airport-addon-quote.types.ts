export type AddonTier = 'Basic' | 'Comfort' | 'Premium';
export type TimeBand = 'DAY' | 'EVENING' | 'NIGHT';

export interface AirportAddonQuoteRequest {
  pickupCity: string;
  addonTier: AddonTier;
  timeBand: TimeBand;
  trips: number;
  passengers: number;
  includeMeetAndGreet: boolean;
  includeFastTrack: boolean;
  includePrioritySupport: boolean;
  markupPercent?: number;
  couponCode?: string;
}

export interface AirportAddonQuoteBreakdown {
  baseTripCost: number;
  timeBandAdjustment: number;
  passengerAdjustment: number;
  meetAndGreetCost: number;
  fastTrackCost: number;
  prioritySupportCost: number;
  markupAmount: number;
  subtotal: number;
  discount: number;
  convenienceFee: number;
  total: number;
}

export interface AirportAddonQuoteResponse {
  quoteId: string;
  generatedAt: string;
  currency: 'INR';
  request: AirportAddonQuoteRequest;
  breakdown: AirportAddonQuoteBreakdown;
  appliedCoupon?: string;
}

export interface AirportAddonQuoteRules {
  basePerTrip: Record<AddonTier, number>;
  timeBandMultiplier: Record<TimeBand, number>;
  perPassengerAfterTwo: number;
  meetAndGreetPerTrip: number;
  fastTrackPerPassenger: number;
  prioritySupportFlat: number;
  couponDiscountPercent: Record<string, number>;
  maxMarkupPercent: number;
  convenienceFeePercent: number;
}

export interface AirportAddonValidationResult {
  valid: boolean;
  errors: string[];
}
