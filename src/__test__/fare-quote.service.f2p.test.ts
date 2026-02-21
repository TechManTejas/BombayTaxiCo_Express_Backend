import FareQuoteService from '../services/fare-quote.service';

describe('FareQuote Service - F2P', () => {
  const service = FareQuoteService.getInstance();

  it('F2P: should fail with validation errors for incomplete payload', () => {
    const result = service.createQuote({
      pickupCity: 'Mumbai',
    } as any);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Validation failed');
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it('F2P: should generate quote for valid one-way payload', () => {
    const result = service.createQuote({
      pickupCity: 'Mumbai',
      dropCity: 'Pune',
      tripType: 'One-Way Trip',
      pickupTime: '10:45',
      distanceKm: 160,
      passengers: 3,
      largeBags: 2,
      couponCode: 'save15',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.currency).toBe('INR');
    expect(result.data?.quoteId).toMatch(/^Q-\d{6}-\d{4}$/);
    expect(result.data?.appliedCoupon).toBe('SAVE15');
    expect(result.data?.breakdown.total).toBeGreaterThan(0);
  });

  it('F2P: should expose independent copy of default rules', () => {
    const rules1 = service.getDefaultRules();
    const rules2 = service.getDefaultRules();

    rules1.couponPercentByCode.TEMP = 0.99;

    expect(rules2.couponPercentByCode.TEMP).toBeUndefined();
    expect(rules2.minimumFare).toBe(450);
  });
});
