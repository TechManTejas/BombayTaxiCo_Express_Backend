/**
 * Tests for paginatedResponse NaN handling fix
 */
import { paginatedResponse } from '../utils/responseHelpers';

describe('paginatedResponse NaN handling', () => {
  it('should default page to 1 when NaN', () => {
    const result = paginatedResponse(['a'], 10, NaN, 5);
    expect(result.data!.page).toBe(1);
  });

  it('should default total to 0 when NaN', () => {
    const result = paginatedResponse(['a'], NaN, 1, 5);
    expect(result.data!.total).toBe(0);
  });

  it('should default pageSize to 10 when NaN', () => {
    const result = paginatedResponse(['a'], 10, 1, NaN);
    expect(result.data!.pageSize).toBe(10);
  });

  it('should handle all NaN values together', () => {
    const result = paginatedResponse([], NaN, NaN, NaN);
    expect(result.data!.page).toBe(1);
    expect(result.data!.total).toBe(0);
    expect(result.data!.pageSize).toBe(10);
    expect(result.data!.totalPages).toBe(0);
  });

  it('should still work normally with valid numbers', () => {
    const result = paginatedResponse(['a', 'b'], 20, 2, 5);
    expect(result.data!.page).toBe(2);
    expect(result.data!.total).toBe(20);
    expect(result.data!.pageSize).toBe(5);
  });
});
