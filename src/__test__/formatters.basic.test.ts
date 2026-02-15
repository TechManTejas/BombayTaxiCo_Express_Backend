import { formatCurrency, truncateText } from '../utils/formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('should format basic currency correctly', () => {
      expect(formatCurrency(1000)).toBe('₹1,000');
    });

    it('should handle zero values', () => {
      expect(formatCurrency(0)).toBe('₹0');
    });

    it('should handle decimal values', () => {
      expect(formatCurrency(1234.56)).toBe('₹1,234.56');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('₹1,000,000');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-500)).toBe('-₹500');
    });
  });

  describe('truncateText', () => {
    it('should truncate text longer than max length', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long...');
    });

    it('should return original text if shorter than max length', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });

    it('should handle empty string', () => {
      expect(truncateText('', 10)).toBe('');
    });

    it('should handle exact length match', () => {
      const exactText = 'Exact length';
      expect(truncateText(exactText, 12)).toBe('Exact length');
    });

    it('should handle single character', () => {
      expect(truncateText('a', 1)).toBe('a');
    });
  });
});
