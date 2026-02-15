/**
 * Tests for validator edge cases fixed in this change
 */
import { isValidPhone, validatePagination } from '../utils/validators';

describe('isValidPhone with country code', () => {
  it('should accept phone with +91 prefix', () => {
    expect(isValidPhone('+919876543210')).toBe(true);
  });

  it('should accept phone with 91 prefix without plus', () => {
    expect(isValidPhone('919876543210')).toBe(true);
  });

  it('should accept phone with +91 and spaces', () => {
    expect(isValidPhone('+91 9876543210')).toBe(true);
  });

  it('should accept phone with +91 and dashes', () => {
    expect(isValidPhone('+91-9876543210')).toBe(true);
  });

  it('should still reject invalid phone with 91 prefix', () => {
    expect(isValidPhone('+911234567890')).toBe(false);
  });
});

describe('validatePagination edge cases', () => {
  it('should default to page 1 when page is null', () => {
    const result = validatePagination(null, 10);
    expect(result.page).toBe(1);
  });

  it('should default to pageSize 10 when pageSize is null', () => {
    const result = validatePagination(1, null);
    expect(result.pageSize).toBe(10);
  });

  it('should default to page 1 when page is undefined', () => {
    const result = validatePagination(undefined, 10);
    expect(result.page).toBe(1);
  });

  it('should handle page as 0 by defaulting to 1', () => {
    const result = validatePagination(0, 10);
    expect(result.page).toBe(1);
    expect(result.skip).toBe(0);
  });
});
