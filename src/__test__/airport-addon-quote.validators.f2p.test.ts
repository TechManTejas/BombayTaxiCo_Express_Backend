import {
  sanitizeAirportAddonQuoteRequest,
  validateAirportAddonQuoteRequest,
} from '../utils/airport-addon-quote.validators';

describe('airportAddonQuoteValidators - F2P', () => {
  it('F2P: sanitizes unstable user payload values', () => {
    const sanitized = sanitizeAirportAddonQuoteRequest({
      pickupCity: ' ',
      addonTier: 'Unknown' as never,
      timeBand: 'MIDNIGHT' as never,
      trips: 0,
      passengers: 30,
      includeMeetAndGreet: 'yes' as never,
      includeFastTrack: 1 as never,
      includePrioritySupport: null as never,
      markupPercent: 40,
      couponCode: ' ride5 ',
    });

    expect(sanitized.pickupCity).toBe('Unknown');
    expect(sanitized.addonTier).toBe('Basic');
    expect(sanitized.timeBand).toBe('DAY');
    expect(sanitized.trips).toBe(1);
    expect(sanitized.passengers).toBe(12);
    expect(sanitized.includeMeetAndGreet).toBe(false);
    expect(sanitized.includeFastTrack).toBe(false);
    expect(sanitized.includePrioritySupport).toBe(false);
    expect(sanitized.markupPercent).toBe(40);
    expect(sanitized.couponCode).toBe('RIDE5');
  });

  it('F2P: validates a legal request', () => {
    const validation = validateAirportAddonQuoteRequest(
      sanitizeAirportAddonQuoteRequest({
        pickupCity: 'Mumbai',
        addonTier: 'Premium',
        timeBand: 'NIGHT',
        trips: 3,
        passengers: 4,
        includeMeetAndGreet: true,
        includeFastTrack: true,
        includePrioritySupport: true,
        markupPercent: 15,
      })
    );

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it('F2P: rejects out-of-bounds fields', () => {
    const validation = validateAirportAddonQuoteRequest({
      pickupCity: 'A',
      addonTier: 'Comfort',
      timeBand: 'EVENING',
      trips: 0,
      passengers: 0,
      includeMeetAndGreet: false,
      includeFastTrack: false,
      includePrioritySupport: false,
      markupPercent: 30,
      couponCode: undefined,
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Pickup city must have at least 2 characters.');
    expect(validation.errors).toContain('Trips must be an integer between 1 and 30.');
    expect(validation.errors).toContain('Passengers must be an integer between 1 and 12.');
    expect(validation.errors).toContain('Markup percent must be between 0 and 22.');
  });
});
