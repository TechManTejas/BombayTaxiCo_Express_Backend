/**
 * Tests for getMimeTypeFromExtension dot prefix fix and cleanupOldFiles maxAge guard
 */
import { getMimeTypeFromExtension, cleanupOldFiles } from '../utils/file-upload';

describe('getMimeTypeFromExtension without dot prefix', () => {
  it('should resolve jpg without leading dot', () => {
    expect(getMimeTypeFromExtension('jpg')).toBe('image/jpeg');
  });

  it('should resolve png without leading dot', () => {
    expect(getMimeTypeFromExtension('png')).toBe('image/png');
  });

  it('should resolve pdf without leading dot', () => {
    expect(getMimeTypeFromExtension('pdf')).toBe('application/pdf');
  });

  it('should still work with leading dot', () => {
    expect(getMimeTypeFromExtension('.jpg')).toBe('image/jpeg');
  });

  it('should return octet-stream for empty string', () => {
    expect(getMimeTypeFromExtension('')).toBe('application/octet-stream');
  });
});

describe('cleanupOldFiles maxAge guard', () => {
  it('should return 0 for zero maxAge', () => {
    expect(cleanupOldFiles('/tmp/nonexistent', 0)).toBe(0);
  });

  it('should return 0 for negative maxAge', () => {
    expect(cleanupOldFiles('/tmp/nonexistent', -1000)).toBe(0);
  });

  it('should return 0 for NaN maxAge', () => {
    expect(cleanupOldFiles('/tmp/nonexistent', NaN)).toBe(0);
  });
});
