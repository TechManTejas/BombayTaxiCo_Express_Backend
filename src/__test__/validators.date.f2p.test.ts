/**
 * Tests for isValidDate and isFutureDate whitespace trimming fix
 */
import { isValidDate, isFutureDate } from '../utils/validators';

describe('isValidDate whitespace trimming', () => {
  it('should accept date string with leading whitespace', () => {
    expect(isValidDate('  2025-01-15')).toBe(true);
  });

  it('should accept date string with trailing whitespace', () => {
    expect(isValidDate('2025-01-15  ')).toBe(true);
  });

  it('should reject whitespace-only string', () => {
    expect(isValidDate('   ')).toBe(false);
  });
});

describe('isFutureDate whitespace trimming', () => {
  it('should accept future date with leading whitespace', () => {
    expect(isFutureDate('  2099-12-31')).toBe(true);
  });

  it('should accept future date with trailing whitespace', () => {
    expect(isFutureDate('2099-12-31  ')).toBe(true);
  });

  it('should reject whitespace-only string', () => {
    expect(isFutureDate('   ')).toBe(false);
  });
});
