/**
 * F2P tests for API response pagination bug fixes.
 * These tests would fail on the base branch and pass after the fixes.
 */
import { createPaginatedResponse } from '../utils/api-response';

describe('createPaginatedResponse F2P Tests', () => {
  describe('Pagination validation', () => {
    it('should handle Infinity page values', () => {
      // Bug: Should handle Infinity values gracefully
      const response = createPaginatedResponse(['a', 'b'], Infinity, 10, 2);
      expect(response.pagination.page).toBe(1); // Should default to 1
      expect(response.pagination.pageSize).toBe(10);
      expect(response.pagination.total).toBe(2);
    });

    it('should handle Infinity pageSize values', () => {
      // Bug: Should handle Infinity values gracefully
      const response = createPaginatedResponse(['a', 'b'], 1, Infinity, 2);
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.pageSize).toBe(10); // Should default to 10
      expect(response.pagination.total).toBe(2);
    });

    it('should handle Infinity total values', () => {
      // Bug: Should handle Infinity values gracefully
      const response = createPaginatedResponse(['a', 'b'], 1, 10, Infinity);
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.pageSize).toBe(10);
      expect(response.pagination.total).toBe(0); // Should default to 0
    });

    it('should handle NaN page values', () => {
      // Bug: Should handle NaN values gracefully
      const response = createPaginatedResponse(['a', 'b'], NaN, 10, 2);
      expect(response.pagination.page).toBe(1); // Should default to 1
      expect(response.pagination.pageSize).toBe(10);
      expect(response.pagination.total).toBe(2);
    });

    it('should handle NaN pageSize values', () => {
      // Bug: Should handle NaN values gracefully
      const response = createPaginatedResponse(['a', 'b'], 1, NaN, 2);
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.pageSize).toBe(10); // Should default to 10
      expect(response.pagination.total).toBe(2);
    });

    it('should handle NaN total values', () => {
      // Bug: Should handle NaN values gracefully
      const response = createPaginatedResponse(['a', 'b'], 1, 10, NaN);
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.pageSize).toBe(10);
      expect(response.pagination.total).toBe(0); // Should default to 0
    });
  });
});
