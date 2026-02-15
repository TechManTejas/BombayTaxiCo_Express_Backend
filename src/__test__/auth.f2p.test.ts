/**
 * Tests for auth utility edge cases fixed in this change
 */
import { validatePasswordStrength, extractTokenFromHeader } from '../utils/auth';

describe('validatePasswordStrength edge cases', () => {
  it('should return error for empty string password', () => {
    const result = validatePasswordStrength('');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should not crash on empty password', () => {
    expect(() => validatePasswordStrength('')).not.toThrow();
  });
});

describe('extractTokenFromHeader edge cases', () => {
  it('should handle header with leading whitespace', () => {
    const token = extractTokenFromHeader('  Bearer abc123');
    expect(token).toBe('abc123');
  });

  it('should handle header with trailing whitespace on token', () => {
    const token = extractTokenFromHeader('Bearer abc123  ');
    expect(token).toBe('abc123');
  });
});
