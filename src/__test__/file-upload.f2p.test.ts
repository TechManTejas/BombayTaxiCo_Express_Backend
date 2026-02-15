/**
 * Tests for file-upload edge cases fixed in this change
 */
import { getMimeTypeFromExtension } from '../utils/file-upload';

describe('getMimeTypeFromExtension case insensitivity', () => {
  it('should handle uppercase .JPG extension', () => {
    expect(getMimeTypeFromExtension('.JPG')).toBe('image/jpeg');
  });

  it('should handle mixed case .Png extension', () => {
    expect(getMimeTypeFromExtension('.Png')).toBe('image/png');
  });

  it('should handle uppercase .PDF extension', () => {
    expect(getMimeTypeFromExtension('.PDF')).toBe('application/pdf');
  });

  it('should handle uppercase .MP4 extension', () => {
    expect(getMimeTypeFromExtension('.MP4')).toBe('video/mp4');
  });

  it('should still return octet-stream for unknown uppercase extension', () => {
    expect(getMimeTypeFromExtension('.XYZ')).toBe('application/octet-stream');
  });
});
