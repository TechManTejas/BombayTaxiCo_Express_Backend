import AirportAddonQuoteService from '../utils/airport-addon-quote.service';

describe('airportAddonQuoteService - F2P', () => {
  it('F2P: returns failed result for invalid payload', () => {
    const service = AirportAddonQuoteService.getInstance();

    const result = service.generateQuote({
      pickupCity: '',
      addonTier: 'Basic',
      timeBand: 'DAY',
      trips: 0,
      passengers: 1,
      includeMeetAndGreet: false,
      includeFastTrack: false,
      includePrioritySupport: false,
      markupPercent: 99,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Validation failed');
    expect((result.errors || []).length).toBeGreaterThan(0);
  });

  it('F2P: returns full response for valid payload', () => {
    const service = AirportAddonQuoteService.getInstance();

    const result = service.generateQuote({
      pickupCity: 'Mumbai',
      addonTier: 'Comfort',
      timeBand: 'EVENING',
      trips: 2,
      passengers: 4,
      includeMeetAndGreet: true,
      includeFastTrack: true,
      includePrioritySupport: true,
      markupPercent: 12,
      couponCode: 'AIR8',
    });

    expect(result.success).toBe(true);
    expect(result.data?.currency).toBe('INR');
    expect(result.data?.quoteId.startsWith('AAQ-')).toBe(true);
    expect(result.data?.breakdown.total).toBeGreaterThan(0);
    expect(result.data?.appliedCoupon).toBe('AIR8');
  });

  it('F2P: returns cloned rules each call', () => {
    const service = AirportAddonQuoteService.getInstance();
    const a = service.getDefaultRules();
    const b = service.getDefaultRules();

    expect(a).not.toBe(b);
    expect(a.basePerTrip).not.toBe(b.basePerTrip);
    expect(a.maxMarkupPercent).toBe(22);
  });
});
