import {
  formatPhone,
  formatINR,
  formatDate,
  formatBookingNumber,
  truncateString,
  titleCase,
  formatDistance,
} from '../utils/formatters';

describe('Formatters Edge Cases', () => {
  describe('formatPhone', () => {
    it('should handle phone numbers with spaces', () => {
      expect(formatPhone('98765 43210')).toBe('+91 98765-43210');
    });

    it('should handle phone numbers with special characters', () => {
      expect(formatPhone('98765-43210')).toBe('+91 98765-43210');
    });

    it('should handle empty string', () => {
      expect(formatPhone('')).toBe('');
    });

    it('should handle very long numbers', () => {
      expect(formatPhone('1234567890123')).toBe('1234567890123');
    });
  });

  describe('formatINR', () => {
    it('should handle very large amounts', () => {
      expect(formatINR(999999999)).toContain('₹');
    });

    it('should handle decimal amounts', () => {
      expect(formatINR(1234.56)).toBe('₹1,234.56');
    });

    it('should handle negative amounts', () => {
      expect(formatINR(-500)).toBe('₹-500');
    });

    it('should handle string numbers', () => {
      expect(formatINR('1000' as any)).toBe('₹1000');
    });
  });

  describe('formatDate', () => {
    it('should handle timestamp input', () => {
      const timestamp = new Date('2025-06-15').getTime();
      expect(formatDate(timestamp as any)).toBe('2025-06-15');
    });

    it('should handle date with time', () => {
      expect(formatDate('2025-06-15T10:30:00Z')).toBe('2025-06-15');
    });
  });

  describe('formatBookingNumber', () => {
    it('should handle zero', () => {
      expect(formatBookingNumber(0)).toBe('BTC-000000');
    });

    it('should handle string numbers', () => {
      expect(formatBookingNumber('42' as any)).toBe('BTC-000042');
    });

    it('should handle very large numbers', () => {
      expect(formatBookingNumber(999999)).toBe('BTC-999999');
    });
  });

  describe('truncateString', () => {
    it('should handle string exactly at limit', () => {
      expect(truncateString('Hello', 5)).toBe('Hello');
    });

    it('should handle string with special characters', () => {
      expect(truncateString('Hello@World!', 8)).toBe('Hello...');
    });

    it('should handle very small max length', () => {
      expect(truncateString('Hello', 1)).toBe('H');
    });
  });

  describe('titleCase', () => {
    it('should handle mixed case with punctuation', () => {
      expect(titleCase('hello, world!')).toBe('Hello, World!');
    });

    it('should handle single character', () => {
      expect(titleCase('a')).toBe('A');
    });

    it('should handle numbers in string', () => {
      expect(titleCase('hello 123 world')).toBe('Hello 123 World');
    });
  });

  describe('formatDistance', () => {
    it('should handle very small distances', () => {
      expect(formatDistance(0.001)).toBe('0.0 km');
    });

    it('should handle very large distances', () => {
      expect(formatDistance(9999.99)).toBe('10000.0 km');
    });

    it('should handle negative distances', () => {
      expect(formatDistance(-10)).toBe('0 km');
    });
  });
});
