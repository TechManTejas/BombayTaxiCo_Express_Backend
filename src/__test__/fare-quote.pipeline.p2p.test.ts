import FareQuoteService from '../services/fare-quote.service';

describe('FareQuote Pipeline - P2P', () => {
  it('P2P: should preserve singleton instance semantics', () => {
    const instanceA = FareQuoteService.getInstance();
    const instanceB = FareQuoteService.getInstance();

    expect(instanceA).toBe(instanceB);
  });

  it('P2P: should generate unique quote IDs in sequence', () => {
    const service = FareQuoteService.getInstance();

    const first = service.createQuote({
      pickupCity: 'Mumbai',
      dropCity: 'Nashik',
      tripType: 'One-Way Trip',
      pickupTime: '09:00',
      distanceKm: 170,
      passengers: 2,
      largeBags: 1,
    });

    const second = service.createQuote({
      pickupCity: 'Mumbai',
      dropCity: 'Nashik',
      tripType: 'One-Way Trip',
      pickupTime: '09:30',
      distanceKm: 171,
      passengers: 2,
      largeBags: 1,
    });

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(first.data?.quoteId).not.toBe(second.data?.quoteId);
  });

  it('P2P: should keep response contract stable', () => {
    const service = FareQuoteService.getInstance();
    const response = service.createQuote({
      pickupCity: 'Mumbai',
      dropCity: 'Goa',
      tripType: 'Round Trip',
      pickupTime: '07:30',
      distanceKm: 580,
      passengers: 5,
      largeBags: 4,
    });

    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('message');

    if (response.success) {
      expect(response.data).toHaveProperty('request');
      expect(response.data).toHaveProperty('breakdown');
      expect(response.data?.breakdown).toHaveProperty('total');
      expect(typeof response.data?.breakdown.total).toBe('number');
    }
  });
});
