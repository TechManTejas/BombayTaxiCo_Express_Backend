export type QuoteTripType = 'One-Way Trip' | 'Round Trip' | 'Hourly Rental';

export interface FareQuoteRequest {
  pickupCity: string;
  dropCity: string;
  tripType: QuoteTripType;
  pickupTime: string;
  distanceKm?: number;
  durationHours?: number;
  passengers: number;
  largeBags: number;
  couponCode?: string;
}

export interface FareRuleSet {
  baseKmRate: number;
  roundTripMultiplier: number;
  hourlyRate: number;
  minimumFare: number;
  nightChargePercent: number;
  nightWindowStartHour: number;
  nightWindowEndHour: number;
  surgeMultiplier: number;
  bagChargePerUnit: number;
  couponPercentByCode: Record<string, number>;
  serviceTaxPercent: number;
}

export interface FareBreakdown {
  baseFare: number;
  bagSurcharge: number;
  tripAdjustment: number;
  nightCharge: number;
  surgeCharge: number;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  serviceTax: number;
  total: number;
}

export interface FareQuoteResult {
  quoteId: string;
  request: FareQuoteRequest;
  appliedCoupon?: string;
  breakdown: FareBreakdown;
  generatedAt: string;
  currency: 'INR';
}

export interface QuoteValidationResult {
  valid: boolean;
  errors: string[];
}
