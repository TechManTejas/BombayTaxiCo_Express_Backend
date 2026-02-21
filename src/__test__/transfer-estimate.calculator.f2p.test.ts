import { calculateTransferEstimateBreakdown } from '../utils/transfer-estimate.calculator';

describe('transfer-estimate calculator - F2P', () => {
  it('F2P: computes high-demand comfort transfer with add-ons', () => {
    const result = calculateTransferEstimateBreakdown({
      sourceCity: 'Mumbai',
      destinationCity: 'Pune',
      tier: 'Comfort',
      demandBand: 'High',
      distanceKm: 180,
      passengers: 4,
      luggageUnits: 3,
      includeToll: true,
      includeParking: true,
      markupPercent: 10,
      couponCode: undefined,
    });

    expect(result.breakdown.baseDistanceCost).toBe(4320);
    expect(result.breakdown.demandAdjustment).toBe(950.4);
    expect(result.breakdown.passengerSurcharge).toBe(360);
    expect(result.breakdown.total).toBe(7659.53);
  });

  it('F2P: applies coupon discount for premium ride', () => {
    const result = calculateTransferEstimateBreakdown({
      sourceCity: 'Mumbai',
      destinationCity: 'Goa',
      tier: 'Premium',
      demandBand: 'Normal',
      distanceKm: 580,
      passengers: 5,
      luggageUnits: 6,
      includeToll: true,
      includeParking: true,
      markupPercent: 15,
      couponCode: 'PREMIUM10',
    });

    expect(result.appliedCoupon).toBe('PREMIUM10');
    expect(result.breakdown.discount).toBeGreaterThan(0);
    expect(result.breakdown.total).toBe(22749.51);
  });

  it('F2P: computes low-demand economy ride without extras', () => {
    const result = calculateTransferEstimateBreakdown({
      sourceCity: 'Thane',
      destinationCity: 'Nashik',
      tier: 'Economy',
      demandBand: 'Low',
      distanceKm: 170,
      passengers: 2,
      luggageUnits: 1,
      includeToll: false,
      includeParking: false,
      markupPercent: 0,
      couponCode: undefined,
    });

    expect(result.breakdown.tollCost).toBe(0);
    expect(result.breakdown.parkingCost).toBe(0);
    expect(result.breakdown.total).toBe(3032.32);
  });

  it('F2P: ignores unknown coupon code', () => {
    const result = calculateTransferEstimateBreakdown({
      sourceCity: 'Mumbai',
      destinationCity: 'Pune',
      tier: 'Economy',
      demandBand: 'Normal',
      distanceKm: 180,
      passengers: 2,
      luggageUnits: 1,
      includeToll: false,
      includeParking: false,
      markupPercent: 0,
      couponCode: 'UNKNOWN',
    });

    expect(result.appliedCoupon).toBeUndefined();
    expect(result.breakdown.discount).toBe(0);
  });
});
