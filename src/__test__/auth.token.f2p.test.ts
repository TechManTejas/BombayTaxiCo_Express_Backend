/**
 * Tests for generateSecureToken edge cases fixed in this change
 */
import { generateSecureToken } from '../utils/auth';

describe('generateSecureToken edge cases', () => {
  it('should return empty string for zero length', () => {
    expect(generateSecureToken(0)).toBe('');
  });

  it('should return empty string for negative length', () => {
    expect(generateSecureToken(-5)).toBe('');
  });

  it('should return empty string for NaN length', () => {
    expect(generateSecureToken(NaN)).toBe('');
  });

  it('should cap length at 1024 for very large values', () => {
    const result = generateSecureToken(99999);
    expect(result.length).toBe(1024);
  });

  it('should handle fractional length by flooring', () => {
    const result = generateSecureToken(5.9);
    expect(result.length).toBe(5);
  });
});
