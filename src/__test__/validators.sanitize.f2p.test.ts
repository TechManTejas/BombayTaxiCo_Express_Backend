/**
 * Tests for sanitizeString ampersand escaping fixed in this change
 */
import { sanitizeString } from '../utils/validators';

describe('sanitizeString ampersand escaping', () => {
  it('should escape ampersand character', () => {
    expect(sanitizeString('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape ampersand before other HTML entities', () => {
    const result = sanitizeString('a&b<c>d');
    expect(result).toBe('a&amp;b&lt;c&gt;d');
  });

  it('should not double-escape already escaped entities', () => {
    const result = sanitizeString('&amp;');
    expect(result).toBe('&amp;amp;');
  });

  it('should handle string with only ampersands', () => {
    expect(sanitizeString('&&&')).toBe('&amp;&amp;&amp;');
  });
});
