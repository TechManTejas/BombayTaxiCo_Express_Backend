import { formatPhone, formatINR, formatDate } from '../utils/formatters';

describe('Formatters Basic Tests', () => {
  describe('formatPhone', () => {
    it('should format standard 10-digit number', () => {
      expect(formatPhone('9876543210')).toBe('+91 98765-43210');
    });

    it('should handle null input', () => {
      expect(formatPhone(null)).toBe('');
    });

    it('should handle undefined input', () => {
      expect(formatPhone(undefined)).toBe('');
    });
  });

  describe('formatINR', () => {
    it('should format positive amount', () => {
      expect(formatINR(1000)).toBe('₹1,000');
    });

    it('should handle zero', () => {
      expect(formatINR(0)).toBe('₹0');
    });

    it('should handle null', () => {
      expect(formatINR(null)).toBe('₹0');
    });
  });

  describe('formatDate', () => {
    it('should format date object', () => {
      const date = new Date('2025-06-15');
      expect(formatDate(date)).toBe('2025-06-15');
    });

    it('should handle null', () => {
      expect(formatDate(null)).toBe('');
    });

    it('should handle undefined', () => {
      expect(formatDate(undefined)).toBe('');
    });
  });
});
