/**
 * Tests for formatINR Infinity handling and titleCase whitespace fix
 */
import { formatINR, titleCase } from '../utils/formatters';

describe('formatINR Infinity handling', () => {
  it('should return ₹0 for Infinity', () => {
    expect(formatINR(Infinity)).toBe('₹0');
  });

  it('should return ₹0 for negative Infinity', () => {
    expect(formatINR(-Infinity)).toBe('₹0');
  });

  it('should still format valid amounts', () => {
    expect(formatINR(1500)).toBe('₹1,500');
  });
});

describe('titleCase whitespace handling', () => {
  it('should handle tab-separated words', () => {
    expect(titleCase('hello\tworld')).toBe('Hello World');
  });

  it('should handle newline-separated words', () => {
    expect(titleCase('hello\nworld')).toBe('Hello World');
  });

  it('should handle multiple spaces between words', () => {
    expect(titleCase('hello   world')).toBe('Hello World');
  });

  it('should handle mixed whitespace', () => {
    expect(titleCase('hello \t world')).toBe('Hello World');
  });
});
