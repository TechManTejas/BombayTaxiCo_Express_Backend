import AirportAddonQuoteService from '../utils/airport-addon-quote.service';
import { summarizeAirportAddonQuote } from '../utils/airport-addon-quote.formatter';

describe('airportAddonQuotePipeline - P2P', () => {
  it('P2P: keeps singleton identity stable', () => {
    const one = AirportAddonQuoteService.getInstance();
    const two = AirportAddonQuoteService.getInstance();

    expect(one).toBe(two);
  });

  it('P2P: issues unique quote ids on sequential calls', () => {
    const service = AirportAddonQuoteService.getInstance();

    const first = service.generateQuote({
      pickupCity: 'Mumbai',
      addonTier: 'Basic',
      timeBand: 'DAY',
      trips: 1,
      passengers: 2,
      includeMeetAndGreet: false,
      includeFastTrack: false,
      includePrioritySupport: false,
      markupPercent: 0,
    });

    const second = service.generateQuote({
      pickupCity: 'Mumbai',
      addonTier: 'Basic',
      timeBand: 'DAY',
      trips: 1,
      passengers: 2,
      includeMeetAndGreet: false,
      includeFastTrack: false,
      includePrioritySupport: false,
      markupPercent: 0,
    });

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(first.data?.quoteId).not.toBe(second.data?.quoteId);
  });

  it('P2P: preserves response contract and summary output', () => {
    const service = AirportAddonQuoteService.getInstance();

    const result = service.generateQuote({
      pickupCity: 'Pune',
      addonTier: 'Premium',
      timeBand: 'NIGHT',
      trips: 3,
      passengers: 5,
      includeMeetAndGreet: true,
      includeFastTrack: true,
      includePrioritySupport: true,
      markupPercent: 14,
      couponCode: 'RIDE5',
    });

    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');

    if (result.success) {
      expect(result.data).toHaveProperty('request');
      expect(result.data).toHaveProperty('breakdown');
      expect(result.data?.breakdown).toHaveProperty('total');

      const summary = summarizeAirportAddonQuote(result.data!.breakdown);
      expect(summary).toContain('Total:');
      expect(summary.length).toBeGreaterThan(25);
    }
  });
});
