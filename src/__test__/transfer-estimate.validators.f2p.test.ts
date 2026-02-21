import {
  normalizeCoupon,
  sanitizeTransferEstimateRequest,
  validateTransferEstimateRequest,
} from '../utils/transfer-estimate.validators';

describe('transfer-estimate validators - F2P', () => {
  it('F2P: sanitizes request and normalizes coupon', () => {
    const req = sanitizeTransferEstimateRequest({
      sourceCity: '  Mumbai ',
      destinationCity: ' Pune  ',
      tier: 'Comfort',
      demandBand: 'High',
      distanceKm: '180' as any,
      passengers: '4' as any,
      luggageUnits: '3' as any,
      includeToll: 'yes' as any,
      includeParking: '1' as any,
      markupPercent: '10' as any,
      couponCode: ' save8 ',
    });

    expect(req.sourceCity).toBe('Mumbai');
    expect(req.destinationCity).toBe('Pune');
    expect(req.distanceKm).toBe(180);
    expect(req.passengers).toBe(4);
    expect(req.luggageUnits).toBe(3);
    expect(req.couponCode).toBe('SAVE8');
  });

  it('F2P: rejects invalid payload', () => {
    const req = sanitizeTransferEstimateRequest({
      sourceCity: '',
      destinationCity: '',
      tier: 'Ultra' as any,
      demandBand: 'Mid' as any,
      distanceKm: 0,
      passengers: 0,
      luggageUnits: 99,
      includeToll: false,
      includeParking: false,
      markupPercent: 99,
    });

    const result = validateTransferEstimateRequest(req);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('sourceCity is required');
    expect(result.errors).toContain('destinationCity is required');
    expect(result.errors).toContain('tier must be Economy, Comfort, or Premium');
    expect(result.errors).toContain('demandBand must be High, Normal, or Low');
    expect(result.errors).toContain('distanceKm must be an integer between 1 and 4000');
    expect(result.errors).toContain('passengers must be an integer between 1 and 20');
    expect(result.errors).toContain('luggageUnits must be an integer between 0 and 30');
    expect(result.errors).toContain('markupPercent must be between 0 and 25');
  });

  it('F2P: accepts valid payload', () => {
    const req = sanitizeTransferEstimateRequest({
      sourceCity: 'Mumbai',
      destinationCity: 'Goa',
      tier: 'Premium',
      demandBand: 'Low',
      distanceKm: 580,
      passengers: 5,
      luggageUnits: 6,
      includeToll: true,
      includeParking: true,
      markupPercent: 12,
    });

    const result = validateTransferEstimateRequest(req);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('F2P: normalizes only string coupon', () => {
    expect(normalizeCoupon(10 as any)).toBeUndefined();
    expect(normalizeCoupon(null as any)).toBeUndefined();
  });
});
