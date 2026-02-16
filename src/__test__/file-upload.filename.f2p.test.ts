/**
 * Tests for generateUniqueFilename null/empty input fix
 */
import { generateUniqueFilename } from '../utils/file-upload';

describe('generateUniqueFilename null/empty handling', () => {
  it('should not crash for empty string input', () => {
    const result = generateUniqueFilename('');
    expect(result).toContain('file_');
  });

  it('should not crash for null input', () => {
    const result = generateUniqueFilename(null as any);
    expect(result).toContain('file_');
  });

  it('should not crash for undefined input', () => {
    const result = generateUniqueFilename(undefined as any);
    expect(result).toContain('file_');
  });

  it('should still work for valid filename', () => {
    const result = generateUniqueFilename('photo.jpg');
    expect(result).toContain('photo_');
    expect(result).toContain('.jpg');
  });
});
