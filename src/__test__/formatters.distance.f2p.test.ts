/**
 * Tests for formatDistance Infinity handling fix
 */
import { formatDistance } from '../utils/formatters';

describe('formatDistance Infinity handling', () => {
  it('should return 0 km for Infinity', () => {
    expect(formatDistance(Infinity)).toBe('0 km');
  });

  it('should return 0 km for negative Infinity', () => {
    expect(formatDistance(-Infinity)).toBe('0 km');
  });

  it('should still format valid distances', () => {
    expect(formatDistance(12.5)).toBe('12.5 km');
  });
});
