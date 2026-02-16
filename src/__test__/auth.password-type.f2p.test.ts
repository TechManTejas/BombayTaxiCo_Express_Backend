/**
 * Tests for validatePasswordStrength type checking
 */
import { validatePasswordStrength } from '../utils/auth';

describe('validatePasswordStrength type checking', () => {
  it('should reject non-string password (number)', () => {
    const result = validatePasswordStrength(12345678 as any);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password is required and must be a string');
  });

  it('should reject non-string password (object)', () => {
    const result = validatePasswordStrength({ password: '12345678' } as any);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password is required and must be a string');
  });

  it('should reject non-string password (array)', () => {
    const result = validatePasswordStrength(['1', '2', '3', '4', '5', '6', '7', '8'] as any);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password is required and must be a string');
  });

  it('should still work with valid string password', () => {
    const result = validatePasswordStrength('ValidPass123!');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should still reject weak string password', () => {
    const result = validatePasswordStrength('weak');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
