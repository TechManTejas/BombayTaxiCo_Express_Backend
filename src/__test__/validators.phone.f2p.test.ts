/**
 * Tests for isValidPhone +91 prefix handling fix
 */
import { isValidPhone } from '../utils/validators';

describe('isValidPhone +91 prefix handling', () => {
  it('should accept phone with +91 prefix', () => {
    expect(isValidPhone('+919876543210')).toBe(true);
  });

  it('should accept phone with +91 and space', () => {
    expect(isValidPhone('+91 9876543210')).toBe(true);
  });

  it('should still accept plain 10-digit number', () => {
    expect(isValidPhone('9876543210')).toBe(true);
  });

  it('should still accept 91 prefix without +', () => {
    expect(isValidPhone('919876543210')).toBe(true);
  });

  it('should reject invalid number with +91 prefix', () => {
    expect(isValidPhone('+911234567890')).toBe(false);
  });
});
