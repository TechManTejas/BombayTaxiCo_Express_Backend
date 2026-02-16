/**
 * Tests for extractTokenFromHeader case-insensitive Bearer prefix fix
 */
import { extractTokenFromHeader } from '../utils/auth';

describe('extractTokenFromHeader case-insensitive Bearer', () => {
  it('should extract token with lowercase bearer prefix', () => {
    expect(extractTokenFromHeader('bearer mytoken123')).toBe('mytoken123');
  });

  it('should extract token with uppercase BEARER prefix', () => {
    expect(extractTokenFromHeader('BEARER mytoken123')).toBe('mytoken123');
  });

  it('should extract token with mixed case BeArEr prefix', () => {
    expect(extractTokenFromHeader('BeArEr mytoken123')).toBe('mytoken123');
  });

  it('should still work with standard Bearer prefix', () => {
    expect(extractTokenFromHeader('Bearer mytoken123')).toBe('mytoken123');
  });

  it('should still return null for missing header', () => {
    expect(extractTokenFromHeader(undefined)).toBeNull();
  });
});
