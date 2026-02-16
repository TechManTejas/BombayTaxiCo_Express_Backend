/**
 * Tests for AuthRateLimiter expired lockout reset and validatePasswordResetToken fix
 */
import { AuthRateLimiter, validatePasswordResetToken } from '../utils/auth';

describe('AuthRateLimiter expired lockout reset', () => {
  it('should reset count after lockout expires on recordAttempt', () => {
    const limiter = new AuthRateLimiter(3, 100, 60000);

    // Exhaust all attempts to trigger lockout
    limiter.recordAttempt('user1');
    limiter.recordAttempt('user1');
    const lockResult = limiter.recordAttempt('user1');
    expect(lockResult.blocked).toBe(true);

    // Manually expire the lockout
    const record = (limiter as any).attempts.get('user1');
    record.lockedUntil = Date.now() - 1;
    (limiter as any).attempts.set('user1', record);

    // After lockout expires, recordAttempt should reset count
    const afterExpiry = limiter.recordAttempt('user1');
    expect(afterExpiry.blocked).toBe(false);
    expect(afterExpiry.remainingAttempts).toBe(2);
  });
});

describe('validatePasswordResetToken with string expiry', () => {
  it('should handle string expiry by converting to Date', () => {
    const futureDate = new Date(Date.now() + 3600000).toISOString();
    expect(validatePasswordResetToken('sometoken', futureDate as any)).toBe(true);
  });

  it('should return false for invalid date string', () => {
    expect(validatePasswordResetToken('sometoken', 'not-a-date' as any)).toBe(false);
  });
});
