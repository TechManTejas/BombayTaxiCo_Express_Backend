/**
 * Tests for validatePagination infinity and negative value handling
 */
import { validatePagination } from '../utils/validators';

describe('validatePagination edge cases', () => {
  it('should handle Infinity page', () => {
    const result = validatePagination(Infinity, 10);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('should handle negative Infinity page', () => {
    const result = validatePagination(-Infinity, 10);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('should handle Infinity pageSize', () => {
    const result = validatePagination(1, Infinity);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('should handle negative page', () => {
    const result = validatePagination(-5, 10);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('should handle negative pageSize', () => {
    const result = validatePagination(1, -5);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('should still work normally with valid values', () => {
    const result = validatePagination(2, 20);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(20);
    expect(result.skip).toBe(20);
  });
});
