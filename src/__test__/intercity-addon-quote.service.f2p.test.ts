import IntercityAddonQuoteService from '../utils/intercity-addon-quote.service';

describe('intercityAddonQuoteService - F2P', () => {
  it('F2P: returns failed result for invalid payload', () => {
    const service = IntercityAddonQuoteService.getInstance();

    const result = service.generateQuote({
      pickupCity: '',
      addonPlan: 'Saver',
      routeBand: 'SHORT',
      trips: 0,
      passengers: 1,
      includeSnackKit: false,
      includeTravelAssistant: false,
      includeLuggagePriority: false,
      markupPercent: 90,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Validation failed');
    expect((result.errors || []).length).toBeGreaterThan(0);
  });

  it('F2P: returns valid response contract for good payload', () => {
    const service = IntercityAddonQuoteService.getInstance();

    const result = service.generateQuote({
      pickupCity: 'Mumbai',
      addonPlan: 'Flexi',
      routeBand: 'LONG',
      trips: 2,
      passengers: 4,
      includeSnackKit: true,
      includeTravelAssistant: true,
      includeLuggagePriority: true,
      markupPercent: 11,
      couponCode: 'ROAD7',
    });

    expect(result.success).toBe(true);
    expect(result.data?.currency).toBe('INR');
    expect(result.data?.quoteId.startsWith('ICQ-')).toBe(true);
    expect(result.data?.breakdown.total).toBeGreaterThan(0);
    expect(result.data?.appliedCoupon).toBe('ROAD7');
  });

  it('F2P: returns cloned default rules', () => {
    const service = IntercityAddonQuoteService.getInstance();
    const a = service.getDefaultRules();
    const b = service.getDefaultRules();

    expect(a).not.toBe(b);
    expect(a.basePerTrip).not.toBe(b.basePerTrip);
    expect(a.maxMarkupPercent).toBe(23);
  });
});
