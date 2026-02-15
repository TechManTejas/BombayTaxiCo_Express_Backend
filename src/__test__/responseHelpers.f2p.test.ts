/**
 * Tests for responseHelpers edge cases fixed in this change
 */
import { paginatedResponse } from '../utils/responseHelpers';

describe('paginatedResponse edge cases', () => {
  it('should handle negative total gracefully', () => {
    const result = paginatedResponse(['a', 'b'], -5, 1, 10);
    expect(result.data!.total).toBe(0);
    expect(result.data!.totalPages).toBe(0);
  });

  it('should handle zero pageSize by defaulting to 10', () => {
    const result = paginatedResponse(['a'], 50, 1, 0);
    expect(result.data!.pageSize).toBe(10);
    expect(result.data!.totalPages).toBe(5);
  });

  it('should handle negative pageSize by defaulting to 10', () => {
    const result = paginatedResponse(['a'], 100, 1, -5);
    expect(result.data!.pageSize).toBe(10);
    expect(result.data!.totalPages).toBe(10);
  });

  it('should handle negative page by defaulting to 1', () => {
    const result = paginatedResponse(['a'], 50, -1, 10);
    expect(result.data!.page).toBe(1);
  });

  it('should handle zero page by defaulting to 1', () => {
    const result = paginatedResponse(['a'], 50, 0, 10);
    expect(result.data!.page).toBe(1);
  });

  it('should never return negative totalPages', () => {
    const result = paginatedResponse([], -100, 1, 10);
    expect(result.data!.totalPages).toBeGreaterThanOrEqual(0);
  });
});
