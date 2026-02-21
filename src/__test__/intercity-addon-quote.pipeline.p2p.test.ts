import IntercityAddonQuoteService from '../utils/intercity-addon-quote.service';
import { summarizeIntercityAddonQuote } from '../utils/intercity-addon-quote.formatter';

describe('intercityAddonQuotePipeline - P2P', () => {
  it('P2P: keeps singleton identity stable', () => {
    const one = IntercityAddonQuoteService.getInstance();
    const two = IntercityAddonQuoteService.getInstance();
    expect(one).toBe(two);
  });

  it('P2P: issues unique quote ids sequentially', () => {
    const service = IntercityAddonQuoteService.getInstance();

    const first = service.generateQuote({
      pickupCity: 'Mumbai',
      addonPlan: 'Saver',
      routeBand: 'SHORT',
      trips: 1,
      passengers: 2,
      includeSnackKit: false,
      includeTravelAssistant: false,
      includeLuggagePriority: false,
      markupPercent: 0,
    });

    const second = service.generateQuote({
      pickupCity: 'Mumbai',
      addonPlan: 'Saver',
      routeBand: 'SHORT',
      trips: 1,
      passengers: 2,
      includeSnackKit: false,
      includeTravelAssistant: false,
      includeLuggagePriority: false,
      markupPercent: 0,
    });

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(first.data?.quoteId).not.toBe(second.data?.quoteId);
  });

  it('P2P: preserves response contract and summary output', () => {
    const service = IntercityAddonQuoteService.getInstance();

    const result = service.generateQuote({
      pickupCity: 'Pune',
      addonPlan: 'Elite',
      routeBand: 'MEDIUM',
      trips: 3,
      passengers: 5,
      includeSnackKit: true,
      includeTravelAssistant: true,
      includeLuggagePriority: true,
      markupPercent: 14,
      couponCode: 'TRIP5',
    });

    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');

    if (result.success) {
      expect(result.data).toHaveProperty('request');
      expect(result.data).toHaveProperty('breakdown');
      expect(result.data?.breakdown).toHaveProperty('total');

      const summary = summarizeIntercityAddonQuote(result.data!.breakdown);
      expect(summary).toContain('Total:');
      expect(summary.length).toBeGreaterThan(25);
    }
  });
});
