/**
 * Tests for formatter edge cases fixed in this change
 */
import { truncateString, formatDistance } from '../utils/formatters';

describe('truncateString edge cases', () => {
  it('should not produce output longer than maxLen when maxLen is 1', () => {
    const result = truncateString('Hello World', 1);
    expect(result.length).toBeLessThanOrEqual(1);
  });

  it('should not produce output longer than maxLen when maxLen is 2', () => {
    const result = truncateString('Hello World', 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('should not produce output longer than maxLen when maxLen is 3', () => {
    const result = truncateString('Hello World', 3);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('should never produce output longer than maxLen for any value', () => {
    for (let len = 1; len <= 10; len++) {
      const result = truncateString('This is a long test string for truncation', len);
      expect(result.length).toBeLessThanOrEqual(len);
    }
  });

  it('should return first char when maxLen is 1 and string is long', () => {
    expect(truncateString('Hello', 1)).toBe('H');
  });
});

describe('formatDistance edge cases', () => {
  it('should return 0 km for negative distance', () => {
    expect(formatDistance(-5)).toBe('0 km');
  });

  it('should return 0 km for large negative distance', () => {
    expect(formatDistance(-1000)).toBe('0 km');
  });

  it('should return 0 km for -0.1', () => {
    expect(formatDistance(-0.1)).toBe('0 km');
  });
});
