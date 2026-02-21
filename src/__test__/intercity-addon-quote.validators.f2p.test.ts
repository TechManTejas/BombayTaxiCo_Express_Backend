import {
  sanitizeIntercityAddonQuoteRequest,
  validateIntercityAddonQuoteRequest,
} from '../utils/intercity-addon-quote.validators';

describe('intercityAddonQuoteValidators - F2P', () => {
  it('F2P: sanitizes unsafe payload values', () => {
    const sanitized = sanitizeIntercityAddonQuoteRequest({
      pickupCity: ' ',
      addonPlan: 'Unknown' as never,
      routeBand: 'ULTRA' as never,
      trips: 0,
      passengers: 50,
      includeSnackKit: 'yes' as never,
      includeTravelAssistant: 1 as never,
      includeLuggagePriority: null as never,
      markupPercent: 50,
      couponCode: ' trip5 ',
    });

    expect(sanitized.pickupCity).toBe('Unknown');
    expect(sanitized.addonPlan).toBe('Saver');
    expect(sanitized.routeBand).toBe('SHORT');
    expect(sanitized.trips).toBe(1);
    expect(sanitized.passengers).toBe(10);
    expect(sanitized.includeSnackKit).toBe(false);
    expect(sanitized.includeTravelAssistant).toBe(false);
    expect(sanitized.includeLuggagePriority).toBe(false);
    expect(sanitized.couponCode).toBe('TRIP5');
  });

  it('F2P: validates legal payload', () => {
    const result = validateIntercityAddonQuoteRequest(
      sanitizeIntercityAddonQuoteRequest({
        pickupCity: 'Mumbai',
        addonPlan: 'Elite',
        routeBand: 'LONG',
        trips: 3,
        passengers: 4,
        includeSnackKit: true,
        includeTravelAssistant: true,
        includeLuggagePriority: true,
        markupPercent: 15,
      })
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('F2P: rejects out-of-range fields', () => {
    const result = validateIntercityAddonQuoteRequest({
      pickupCity: 'A',
      addonPlan: 'Flexi',
      routeBand: 'MEDIUM',
      trips: 0,
      passengers: 0,
      includeSnackKit: false,
      includeTravelAssistant: false,
      includeLuggagePriority: false,
      markupPercent: 24,
      couponCode: undefined,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Pickup city must have at least 2 characters.');
    expect(result.errors).toContain('Trips must be an integer between 1 and 20.');
    expect(result.errors).toContain('Passengers must be an integer between 1 and 10.');
    expect(result.errors).toContain('Markup percent must be between 0 and 23.');
  });
});
