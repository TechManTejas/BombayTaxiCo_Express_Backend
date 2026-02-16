/**
 * Tests for formatFileSize edge cases fixed in this change
 */
import { formatFileSize } from '../utils/file-upload';

describe('formatFileSize edge cases', () => {
  it('should return 0 Bytes for negative input', () => {
    expect(formatFileSize(-100)).toBe('0 Bytes');
  });

  it('should return 0 Bytes for NaN input', () => {
    expect(formatFileSize(NaN)).toBe('0 Bytes');
  });

  it('should not crash on extremely large values', () => {
    const result = formatFileSize(Number.MAX_SAFE_INTEGER);
    expect(result).toBeDefined();
    expect(result).toContain('GB');
  });
});
