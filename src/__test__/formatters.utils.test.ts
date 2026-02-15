import { formatBookingNumber, truncateString, titleCase } from '../utils/formatters';

describe('Formatters Utility Tests', () => {
  describe('formatBookingNumber', () => {
    it('should format booking number correctly', () => {
      expect(formatBookingNumber(42)).toBe('BTC-000042');
    });

    it('should handle zero', () => {
      expect(formatBookingNumber(0)).toBe('BTC-000000');
    });

    it('should handle null', () => {
      expect(formatBookingNumber(null)).toBe('BTC-000000');
    });
  });

  describe('truncateString', () => {
    it('should truncate long string', () => {
      expect(truncateString('Hello World', 8)).toBe('Hello...');
    });

    it('should return short string unchanged', () => {
      expect(truncateString('Hi', 10)).toBe('Hi');
    });

    it('should handle null', () => {
      expect(truncateString(null, 10)).toBe('');
    });
  });

  describe('titleCase', () => {
    it('should capitalize each word', () => {
      expect(titleCase('hello world')).toBe('Hello World');
    });

    it('should handle single word', () => {
      expect(titleCase('hello')).toBe('Hello');
    });

    it('should handle null', () => {
      expect(titleCase(null)).toBe('');
    });
  });
});
