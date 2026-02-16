/**
 * Tests for api-response edge cases fixed in this change
 */
import { createPaginatedResponse, RateLimiter } from '../utils/api-response';

describe('createPaginatedResponse edge cases', () => {
  it('should handle zero pageSize without division by zero', () => {
    const result = createPaginatedResponse(['a', 'b'], 1, 0, 20);
    expect(result.pagination.pageSize).toBe(10);
    expect(result.pagination.totalPages).toBe(2);
  });

  it('should handle negative pageSize by defaulting to 10', () => {
    const result = createPaginatedResponse(['a'], 1, -5, 30);
    expect(result.pagination.pageSize).toBe(10);
    expect(result.pagination.totalPages).toBe(3);
  });

  it('should handle negative total by defaulting to 0', () => {
    const result = createPaginatedResponse([], 1, 10, -10);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it('should handle zero page by defaulting to 1', () => {
    const result = createPaginatedResponse(['a'], 0, 10, 50);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.hasPrev).toBe(false);
  });
});

describe('RateLimiter stale entry cleanup', () => {
  it('should clean up stale entries when checking isAllowed', () => {
    const limiter = new RateLimiter(2, 100);
    const now = Date.now();

    // Manually set old timestamps that should be expired
    (limiter as any).requests.set('user1', [now - 200, now - 150]);

    // After cleanup, these old entries should be removed and user should be allowed
    expect(limiter.isAllowed('user1')).toBe(true);
  });
});
