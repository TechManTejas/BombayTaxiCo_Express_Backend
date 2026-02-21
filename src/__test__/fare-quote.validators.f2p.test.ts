import {
  normalizeCouponCode,
  sanitizeFareQuoteRequest,
  validateFareQuoteRequest,
} from '../utils/fare-quote.validators';

describe('FareQuote Validators - F2P', () => {
  it('F2P: should normalize coupon code and trim cities', () => {
    const request = sanitizeFareQuoteRequest({
      pickupCity: '  Mumbai  ',
      dropCity: ' Pune ',
      pickupTime: '09:30',
      tripType: 'One-Way Trip',
      distanceKm: 150,
      passengers: 2,
      largeBags: 1,
      couponCode: ' save15 ',
    });

    expect(request.pickupCity).toBe('Mumbai');
    expect(request.dropCity).toBe('Pune');
    expect(request.couponCode).toBe('SAVE15');
  });

  it('F2P: should reject invalid one-way request fields', () => {
    const request = sanitizeFareQuoteRequest({
      pickupCity: 'Mumbai',
      dropCity: 'Mumbai',
      pickupTime: '25:00',
      tripType: 'One-Way Trip',
      distanceKm: -5,
      passengers: 0,
      largeBags: 20,
    } as any);

    const result = validateFareQuoteRequest(request);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('pickupCity and dropCity must be different for one-way trips');
    expect(result.errors).toContain('pickupTime must be in HH:MM format');
    expect(result.errors).toContain('distanceKm must be greater than 0 for distance-based trips');
    expect(result.errors).toContain('passengers must be an integer between 1 and 7');
    expect(result.errors).toContain('largeBags must be an integer between 0 and 10');
  });

  it('F2P: should require duration for hourly rental', () => {
    const request = sanitizeFareQuoteRequest({
      pickupCity: 'Mumbai',
      dropCity: 'Navi Mumbai',
      pickupTime: '13:10',
      tripType: 'Hourly Rental',
      passengers: 1,
      largeBags: 0,
    });

    const result = validateFareQuoteRequest(request);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('durationHours must be greater than 0 for hourly rentals');
  });

  it('F2P: should accept a valid round trip request', () => {
    const request = sanitizeFareQuoteRequest({
      pickupCity: 'Mumbai',
      dropCity: 'Lonavala',
      pickupTime: '06:15',
      tripType: 'Round Trip',
      distanceKm: 150,
      passengers: 4,
      largeBags: 3,
    });

    const result = validateFareQuoteRequest(request);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('F2P: should return undefined for non-string coupon values', () => {
    expect(normalizeCouponCode(12 as any)).toBeUndefined();
    expect(normalizeCouponCode(null as any)).toBeUndefined();
  });
});
