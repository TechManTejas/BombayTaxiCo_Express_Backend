import TransferEstimateService from '../utils/transfer-estimate.service';

describe('transfer-estimate service - F2P', () => {
  const service = TransferEstimateService.getInstance();

  it('F2P: fails validation for incomplete payload', () => {
    const result = service.generateQuote({ sourceCity: 'Mumbai' } as any);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Validation failed');
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it('F2P: generates valid quote for complete payload', () => {
    const result = service.generateQuote({
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
      couponCode: 'save8',
    });

    expect(result.success).toBe(true);
    expect(result.data?.quoteId).toMatch(/^TQ-\d{6}-\d{4}$/);
    expect(result.data?.currency).toBe('INR');
    expect(result.data?.appliedCoupon).toBe('SAVE8');
    expect(result.data?.breakdown.total).toBeGreaterThan(0);
  });

  it('F2P: returns isolated rules copy', () => {
    const a = service.getDefaultRules();
    const b = service.getDefaultRules();

    a.couponDiscountByCode.NEW = 0.9;

    expect(b.couponDiscountByCode.NEW).toBeUndefined();
    expect(b.perKmByTier.Economy).toBe(18);
  });
});
