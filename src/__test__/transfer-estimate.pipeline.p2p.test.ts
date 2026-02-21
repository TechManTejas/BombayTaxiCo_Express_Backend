import TransferEstimateService from '../utils/transfer-estimate.service';
import { summarizeTransferEstimate } from '../utils/transfer-estimate.formatter';

describe('transfer-estimate pipeline - P2P', () => {
  it('P2P: preserves singleton behavior', () => {
    const a = TransferEstimateService.getInstance();
    const b = TransferEstimateService.getInstance();

    expect(a).toBe(b);
  });

  it('P2P: creates unique quote IDs', () => {
    const service = TransferEstimateService.getInstance();

    const one = service.generateQuote({
      sourceCity: 'Mumbai',
      destinationCity: 'Pune',
      tier: 'Economy',
      demandBand: 'Normal',
      distanceKm: 180,
      passengers: 2,
      luggageUnits: 1,
      includeToll: false,
      includeParking: false,
      markupPercent: 0,
    });

    const two = service.generateQuote({
      sourceCity: 'Mumbai',
      destinationCity: 'Pune',
      tier: 'Economy',
      demandBand: 'Normal',
      distanceKm: 180,
      passengers: 2,
      luggageUnits: 1,
      includeToll: false,
      includeParking: false,
      markupPercent: 0,
    });

    expect(one.success).toBe(true);
    expect(two.success).toBe(true);
    expect(one.data?.quoteId).not.toBe(two.data?.quoteId);
  });

  it('P2P: keeps response contract stable', () => {
    const service = TransferEstimateService.getInstance();
    const result = service.generateQuote({
      sourceCity: 'Mumbai',
      destinationCity: 'Goa',
      tier: 'Premium',
      demandBand: 'Low',
      distanceKm: 580,
      passengers: 5,
      luggageUnits: 6,
      includeToll: true,
      includeParking: true,
      markupPercent: 12,
    });

    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');

    if (result.success) {
      expect(result.data).toHaveProperty('request');
      expect(result.data).toHaveProperty('breakdown');
      expect(result.data?.breakdown).toHaveProperty('total');
      const summary = summarizeTransferEstimate(result.data!.breakdown);
      expect(summary).toContain('Total:');
      expect(summary.length).toBeGreaterThan(20);
    }
  });
});
