import { calculateAirportAddonQuoteBreakdown } from '../utils/airport-addon-quote.calculator';

describe('airportAddonQuoteCalculator - F2P', () => {
  it('F2P: computes totals with add-ons and coupon', () => {
    const { breakdown, appliedCoupon } = calculateAirportAddonQuoteBreakdown({
      pickupCity: 'Mumbai',
      addonTier: 'Premium',
      timeBand: 'NIGHT',
      trips: 4,
      passengers: 5,
      includeMeetAndGreet: true,
      includeFastTrack: true,
      includePrioritySupport: true,
      markupPercent: 10,
      couponCode: 'PRIOR10',
    });

    expect(appliedCoupon).toBe('PRIOR10');
    expect(breakdown.baseTripCost).toBe(8400);
    expect(breakdown.timeBandAdjustment).toBe(1680);
    expect(breakdown.passengerAdjustment).toBe(1440);
    expect(breakdown.meetAndGreetCost).toBe(1200);
    expect(breakdown.fastTrackCost).toBe(3600);
    expect(breakdown.prioritySupportCost).toBe(450);
    expect(breakdown.markupAmount).toBe(1677);
    expect(breakdown.subtotal).toBe(18447);
    expect(breakdown.discount).toBe(1844.7);
    expect(breakdown.convenienceFee).toBe(415.06);
    expect(breakdown.total).toBe(17017.36);
  });

  it('F2P: computes baseline totals with no options', () => {
    const { breakdown, appliedCoupon } = calculateAirportAddonQuoteBreakdown({
      pickupCity: 'Pune',
      addonTier: 'Basic',
      timeBand: 'DAY',
      trips: 2,
      passengers: 2,
      includeMeetAndGreet: false,
      includeFastTrack: false,
      includePrioritySupport: false,
      markupPercent: 0,
    });

    expect(appliedCoupon).toBeUndefined();
    expect(breakdown.baseTripCost).toBe(1800);
    expect(breakdown.timeBandAdjustment).toBe(0);
    expect(breakdown.passengerAdjustment).toBe(0);
    expect(breakdown.subtotal).toBe(1800);
    expect(breakdown.convenienceFee).toBe(45);
    expect(breakdown.total).toBe(1845);
  });

  it('F2P: caps markup at max rule value', () => {
    const { breakdown } = calculateAirportAddonQuoteBreakdown({
      pickupCity: 'Navi Mumbai',
      addonTier: 'Comfort',
      timeBand: 'EVENING',
      trips: 3,
      passengers: 4,
      includeMeetAndGreet: true,
      includeFastTrack: false,
      includePrioritySupport: false,
      markupPercent: 80,
    });

    expect(breakdown.baseTripCost).toBe(4200);
    expect(breakdown.timeBandAdjustment).toBe(420);
    expect(breakdown.passengerAdjustment).toBe(720);
    expect(breakdown.markupAmount).toBe(1372.8);
    expect(breakdown.total).toBe(7803.12);
  });
});
