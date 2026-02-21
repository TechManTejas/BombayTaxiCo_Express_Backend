export type TransferTier = 'Economy' | 'Comfort' | 'Premium';
export type DemandBand = 'High' | 'Normal' | 'Low';

export interface TransferEstimateRequest {
  sourceCity: string;
  destinationCity: string;
  tier: TransferTier;
  demandBand: DemandBand;
  distanceKm: number;
  passengers: number;
  luggageUnits: number;
  includeToll: boolean;
  includeParking: boolean;
  markupPercent?: number;
  couponCode?: string;
}

export interface TransferEstimateRules {
  perKmByTier: Record<TransferTier, number>;
  demandMultiplier: Record<DemandBand, number>;
  passengerSurchargePerHead: number;
  luggageSurchargePerUnit: number;
  tollFlatByBand: Record<DemandBand, number>;
  parkingFlat: number;
  serviceChargePercent: number;
  maxMarkupPercent: number;
  couponDiscountByCode: Record<string, number>;
}

export interface TransferEstimateBreakdown {
  baseDistanceCost: number;
  demandAdjustment: number;
  passengerSurcharge: number;
  luggageSurcharge: number;
  tollCost: number;
  parkingCost: number;
  markupAmount: number;
  subtotal: number;
  discount: number;
  serviceCharge: number;
  total: number;
}

export interface TransferEstimateResponse {
  quoteId: string;
  generatedAt: string;
  currency: 'INR';
  request: TransferEstimateRequest;
  breakdown: TransferEstimateBreakdown;
  appliedCoupon?: string;
}

export interface TransferEstimateValidationResult {
  valid: boolean;
  errors: string[];
}
