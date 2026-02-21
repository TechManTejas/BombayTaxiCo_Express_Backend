import { calculateIntercityAddonQuoteBreakdown } from '../utils/intercity-addon-quote.calculator';

describe('intercityAddonQuoteCalculator - F2P', () => {
  it('F2P: computes totals with all options and coupon', () => {
    const { breakdown, appliedCoupon } = calculateIntercityAddonQuoteBreakdown({
      pickupCity: 'Mumbai',
      addonPlan: 'Elite',
      routeBand: 'LONG',
      trips: 4,
      passengers: 5,
      includeSnackKit: true,
      includeTravelAssistant: true,
      includeLuggagePriority: true,
      markupPercent: 10,
      couponCode: 'ELITE9',
    });

    expect(appliedCoupon).toBe('ELITE9');
    expect(breakdown.baseCost).toBe(13600);
    expect(breakdown.routeAdjustment).toBe(4760);
    expect(breakdown.passengerAdjustment).toBe(1680);
    expect(breakdown.snackKitCost).toBe(2200);
    expect(breakdown.travelAssistantCost).toBe(1800);
    expect(breakdown.luggagePriorityCost).toBe(1120);
    expect(breakdown.markupAmount).toBe(2516);
    expect(breakdown.subtotal).toBe(27676);
    expect(breakdown.discount).toBe(2490.84);
    expect(breakdown.serviceFee).toBe(629.63);
    expect(breakdown.total).toBe(25814.79);
  });

  it('F2P: computes baseline totals without optional services', () => {
    const { breakdown, appliedCoupon } = calculateIntercityAddonQuoteBreakdown({
      pickupCity: 'Pune',
      addonPlan: 'Saver',
      routeBand: 'SHORT',
      trips: 2,
      passengers: 2,
      includeSnackKit: false,
      includeTravelAssistant: false,
      includeLuggagePriority: false,
      markupPercent: 0,
    });

    expect(appliedCoupon).toBeUndefined();
    expect(breakdown.baseCost).toBe(3200);
    expect(breakdown.routeAdjustment).toBe(0);
    expect(breakdown.passengerAdjustment).toBe(0);
    expect(breakdown.subtotal).toBe(3200);
    expect(breakdown.serviceFee).toBe(80);
    expect(breakdown.total).toBe(3280);
  });

  it('F2P: caps markup at max rule', () => {
    const { breakdown } = calculateIntercityAddonQuoteBreakdown({
      pickupCity: 'Nashik',
      addonPlan: 'Flexi',
      routeBand: 'MEDIUM',
      trips: 3,
      passengers: 4,
      includeSnackKit: true,
      includeTravelAssistant: false,
      includeLuggagePriority: false,
      markupPercent: 90,
    });

    expect(breakdown.baseCost).toBe(7200);
    expect(breakdown.routeAdjustment).toBe(1296);
    expect(breakdown.passengerAdjustment).toBe(840);
    expect(breakdown.markupAmount).toBe(2450.88);
    expect(breakdown.total).toBe(13434.55);
  });
});
