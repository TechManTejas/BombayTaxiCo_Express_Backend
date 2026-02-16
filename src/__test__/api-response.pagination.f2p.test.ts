/**
 * Tests for createPaginatedResponse NaN handling fix
 */
import { createPaginatedResponse } from '../utils/api-response';

describe('createPaginatedResponse NaN handling', () => {
  it('should default page to 1 when NaN', () => {
    const result = createPaginatedResponse(['a'], NaN, 10, 1);
    expect(result.pagination.page).toBe(1);
  });

  it('should default pageSize to 10 when NaN', () => {
    const result = createPaginatedResponse(['a'], 1, NaN, 1);
    expect(result.pagination.pageSize).toBe(10);
  });

  it('should default total to 0 when NaN', () => {
    const result = createPaginatedResponse(['a'], 1, 10, NaN);
    expect(result.pagination.total).toBe(0);
  });

  it('should handle all NaN values together', () => {
    const result = createPaginatedResponse([], NaN, NaN, NaN);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.pageSize).toBe(10);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it('should still work normally with valid numbers', () => {
    const result = createPaginatedResponse(['a', 'b'], 2, 5, 20);
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.pageSize).toBe(5);
    expect(result.pagination.total).toBe(20);
    expect(result.pagination.totalPages).toBe(4);
  });
});
