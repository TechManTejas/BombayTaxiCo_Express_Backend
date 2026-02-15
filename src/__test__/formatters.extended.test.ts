import { formatINR, formatDistance, formatDate, formatPhone, formatBookingNumber, truncateString, titleCase } from '../utils/formatters';

describe('Formatters Extended Tests', () => {
  describe('formatINR extended tests', () => {
    it('should format large amounts', () => {
      expect(formatINR(1000000)).toBe('₹1,000,000');
    });

    it('should format decimal amounts', () => {
      expect(formatINR(1234.56)).toBe('₹1,235');
    });

    it('should format zero', () => {
      expect(formatINR(0)).toBe('₹0');
    });

    it('should handle negative amounts', () => {
      expect(formatINR(-100)).toBe('₹-100');
    });

    it('should handle undefined', () => {
      expect(formatINR(undefined)).toBe('₹0');
    });

    it('should handle NaN', () => {
      expect(formatINR(NaN)).toBe('₹0');
    });

    it('should format string numbers', () => {
      expect(formatINR('5000' as any)).toBe('₹5,000');
    });

    it('should handle very large numbers', () => {
      expect(formatINR(1000000000)).toBe('₹1,000,000,000');
    });
  });

  describe('formatDistance extended tests', () => {
    it('should format decimal distances', () => {
      expect(formatDistance(12.345)).toBe('12.3 km');
    });

    it('should format zero distance', () => {
      expect(formatDistance(0)).toBe('0.0 km');
    });

    it('should handle negative distances', () => {
      expect(formatDistance(-5.5)).toBe('-5.5 km');
    });

    it('should handle null', () => {
      expect(formatDistance(null)).toBe('0 km');
    });

    it('should handle undefined', () => {
      expect(formatDistance(undefined)).toBe('0 km');
    });

    it('should handle NaN', () => {
      expect(formatDistance(NaN)).toBe('0 km');
    });

    it('should format small distances', () => {
      expect(formatDistance(0.1)).toBe('0.1 km');
    });

    it('should format large distances', () => {
      expect(formatDistance(999.9)).toBe('999.9 km');
    });
  });

  describe('formatDate extended tests', () => {
    it('should format date string', () => {
      expect(formatDate('2025-12-25')).toBe('2025-12-25');
    });

    it('should format timestamp', () => {
      expect(formatDate(1703500800000)).toBe('2025-12-25');
    });

    it('should handle invalid date', () => {
      expect(formatDate('invalid-date')).toBe('');
    });

    it('should handle empty string', () => {
      expect(formatDate('')).toBe('');
    });

    it('should handle zero timestamp', () => {
      expect(formatDate(0)).toBe('1970-01-01');
    });

    it('should handle negative timestamp', () => {
      expect(formatDate(-1)).toBe('');
    });

    it('should format current date', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(formatDate(new Date())).toBe(today);
    });

    it('should handle date with time', () => {
      expect(formatDate('2025-12-25T15:30:00.000Z')).toBe('2025-12-25');
    });
  });

  describe('formatPhone extended tests', () => {
    it('should format phone with spaces', () => {
      expect(formatPhone('9876 543 210')).toBe('+91 98765-43210');
    });

    it('should format phone with dashes', () => {
      expect(formatPhone('9876-543-210')).toBe('+91 98765-43210');
    });

    it('should handle phone with country code', () => {
      expect(formatPhone('+919876543210')).toBe('+91 98765-43210');
    });

    it('should handle short phone numbers', () => {
      expect(formatPhone('12345')).toBe('12345');
    });

    it('should handle long phone numbers', () => {
      expect(formatPhone('9876543210123')).toBe('9876543210123');
    });

    it('should handle phone with letters', () => {
      expect(formatPhone('98765abc3210')).toBe('+91 987653210');
    });

    it('should handle empty phone', () => {
      expect(formatPhone('')).toBe('');
    });

    it('should handle phone with special chars', () => {
      expect(formatPhone('9876-543-210 ext.123')).toBe('+91 9876543210');
    });
  });

  describe('formatBookingNumber extended tests', () => {
    it('should format single digit', () => {
      expect(formatBookingNumber(5)).toBe('BTC-000005');
    });

    it('should format double digit', () => {
      expect(formatBookingNumber(42)).toBe('BTC-000042');
    });

    it('should format triple digit', () => {
      expect(formatBookingNumber(123)).toBe('BTC-000123');
    });

    it('should format four digit', () => {
      expect(formatBookingNumber(9999)).toBe('BTC-009999');
    });

    it('should format five digit', () => {
      expect(formatBookingNumber(12345)).toBe('BTC-012345');
    });

    it('should format six digit', () => {
      expect(formatBookingNumber(123456)).toBe('BTC-123456');
    });

    it('should handle string numbers', () => {
      expect(formatBookingNumber('789' as any)).toBe('BTC-000789');
    });

    it('should handle negative numbers', () => {
      expect(formatBookingNumber(-1)).toBe('BTC-000000');
    });
  });

  describe('truncateString extended tests', () => {
    it('should truncate exactly at limit', () => {
      expect(truncateString('Hello', 5)).toBe('Hello');
    });

    it('should truncate one over limit', () => {
      expect(truncateString('Hello World', 5)).toBe('Hello...');
    });

    it('should handle empty string', () => {
      expect(truncateString('', 10)).toBe('');
    });

    it('should handle zero limit', () => {
      expect(truncateString('Hello', 0)).toBe('');
    });

    it('should handle negative limit', () => {
      expect(truncateString('Hello', -1)).toBe('');
    });

    it('should handle string shorter than limit', () => {
      expect(truncateString('Hi', 10)).toBe('Hi');
    });

    it('should handle string with spaces', () => {
      expect(truncateString('Hello World Test', 11)).toBe('Hello World...');
    });

    it('should handle very long string', () => {
      expect(truncateString('This is a very long string that should be truncated', 20)).toBe('This is a very long...');
    });
  });

  describe('titleCase extended tests', () => {
    it('should capitalize multiple words', () => {
      expect(titleCase('hello world test')).toBe('Hello World Test');
    });

    it('should handle mixed case', () => {
      expect(titleCase('hELLo wORLd')).toBe('Hello World');
    });

    it('should handle extra spaces', () => {
      expect(titleCase('  hello   world  ')).toBe('Hello World');
    });

    it('should handle single word', () => {
      expect(titleCase('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(titleCase('')).toBe('');
    });

    it('should handle spaces only', () => {
      expect(titleCase('   ')).toBe('');
    });

    it('should handle special characters', () => {
      expect(titleCase('hello-world_test')).toBe('Hello-world_test');
    });

    it('should handle numbers in string', () => {
      expect(titleCase('hello 123 world')).toBe('Hello 123 World');
    });
  });
});
