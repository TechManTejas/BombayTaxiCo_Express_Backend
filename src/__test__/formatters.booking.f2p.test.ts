/**
 * Tests for formatBookingNumber negative/fractional fix and truncateString NaN fix
 */
import { formatBookingNumber, truncateString } from '../utils/formatters';

describe('formatBookingNumber edge cases', () => {
  it('should handle negative numbers by using absolute value', () => {
    expect(formatBookingNumber(-5)).toBe('BTC-000005');
  });

  it('should handle fractional numbers by flooring', () => {
    expect(formatBookingNumber(42.9)).toBe('BTC-000042');
  });

  it('should handle negative fractional numbers', () => {
    expect(formatBookingNumber(-3.7)).toBe('BTC-000004');
  });
});

describe('truncateString NaN maxLen', () => {
  it('should return empty string for NaN maxLen', () => {
    expect(truncateString('hello world', NaN)).toBe('');
  });

  it('should return empty string for Infinity maxLen treated as valid', () => {
    expect(truncateString('hello', Infinity)).toBe('hello');
  });
});
