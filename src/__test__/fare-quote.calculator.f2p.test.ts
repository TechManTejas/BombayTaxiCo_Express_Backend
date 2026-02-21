import { calculateFareBreakdown, defaultFareRuleSet, isNightWindow } from '../utils/fare-quote.calculator';

describe('FareQuote Calculator - F2P', () => {
  it('F2P: should calculate one-way fare with minimum fare floor', () => {
    const result = calculateFareBreakdown({
      pickupCity: 'Mumbai',
      dropCity: 'Thane',
      tripType: 'One-Way Trip',
      pickupTime: '14:00',
      distanceKm: 10,
      passengers: 2,
      largeBags: 1,
    });

    expect(result.breakdown.baseFare).toBe(450);
    expect(result.breakdown.tripAdjustment).toBe(270);
    expect(result.breakdown.bagSurcharge).toBe(40);
    expect(result.breakdown.nightCharge).toBe(0);
    expect(result.breakdown.total).toBeGreaterThan(0);
  });

  it('F2P: should apply night charge and coupon discount', () => {
    const result = calculateFareBreakdown({
      pickupCity: 'Mumbai',
      dropCity: 'Pune',
      tripType: 'One-Way Trip',
      pickupTime: '23:15',
      distanceKm: 200,
      passengers: 2,
      largeBags: 2,
      couponCode: 'WELCOME10',
    });

    expect(result.breakdown.baseFare).toBe(3600);
    expect(result.breakdown.nightCharge).toBe(736);
    expect(result.appliedCoupon).toBe('WELCOME10');
    expect(result.breakdown.discount).toBe(441.6);
    expect(result.breakdown.total).toBe(4173.12);
  });

  it('F2P: should compute hourly rental from duration', () => {
    const result = calculateFareBreakdown({
      pickupCity: 'Mumbai',
      dropCity: 'Mumbai',
      tripType: 'Hourly Rental',
      pickupTime: '12:00',
      durationHours: 3,
      passengers: 1,
      largeBags: 0,
    });

    expect(result.breakdown.baseFare).toBe(960);
    expect(result.breakdown.tripAdjustment).toBe(0);
    expect(result.breakdown.subtotal).toBe(960);
    expect(result.breakdown.total).toBe(1008);
  });

  it('F2P: should identify night window correctly across midnight', () => {
    expect(isNightWindow('23:00', defaultFareRuleSet)).toBe(true);
    expect(isNightWindow('03:00', defaultFareRuleSet)).toBe(true);
    expect(isNightWindow('15:00', defaultFareRuleSet)).toBe(false);
  });
});
