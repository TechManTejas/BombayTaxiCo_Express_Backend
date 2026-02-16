/**
 * Tests for isImageFile, isDocumentFile, isVideoFile, isAudioFile null guard fixes
 */
import { isImageFile, isDocumentFile, isVideoFile, isAudioFile } from '../utils/file-upload';

describe('isImageFile null guard', () => {
  it('should return false for null input', () => {
    expect(isImageFile(null as any)).toBe(false);
  });

  it('should return false for undefined input', () => {
    expect(isImageFile(undefined as any)).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isImageFile('')).toBe(false);
  });

  it('should still work for valid image mime type', () => {
    expect(isImageFile('image/png')).toBe(true);
  });
});

describe('isDocumentFile null guard', () => {
  it('should return false for null input', () => {
    expect(isDocumentFile(null as any)).toBe(false);
  });

  it('should return false for undefined input', () => {
    expect(isDocumentFile(undefined as any)).toBe(false);
  });
});

describe('isVideoFile null guard', () => {
  it('should return false for null input', () => {
    expect(isVideoFile(null as any)).toBe(false);
  });

  it('should return false for undefined input', () => {
    expect(isVideoFile(undefined as any)).toBe(false);
  });
});

describe('isAudioFile null guard', () => {
  it('should return false for null input', () => {
    expect(isAudioFile(null as any)).toBe(false);
  });

  it('should return false for undefined input', () => {
    expect(isAudioFile(undefined as any)).toBe(false);
  });
});
