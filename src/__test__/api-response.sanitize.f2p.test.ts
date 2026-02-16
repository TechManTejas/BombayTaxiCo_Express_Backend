/**
 * Tests for sanitizeInput ampersand escaping and ApiCache TTL fix
 */
import { sanitizeInput, ApiCache } from '../utils/api-response';

describe('sanitizeInput ampersand escaping', () => {
  it('should escape ampersand in strings', () => {
    expect(sanitizeInput('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape ampersand before other entities', () => {
    expect(sanitizeInput('a&b<c')).toBe('a&amp;b&lt;c');
  });

  it('should escape ampersand in nested objects', () => {
    const result = sanitizeInput({ name: 'A & B' });
    expect(result.name).toBe('A &amp; B');
  });

  it('should escape ampersand in arrays', () => {
    const result = sanitizeInput(['X & Y', 'Z & W']);
    expect(result[0]).toBe('X &amp; Y');
    expect(result[1]).toBe('Z &amp; W');
  });
});

describe('ApiCache set with invalid TTL', () => {
  it('should not store entry with zero TTL', () => {
    const cache = new ApiCache();
    cache.set('key1', 'data', 0);
    expect(cache.get('key1')).toBeNull();
  });

  it('should not store entry with negative TTL', () => {
    const cache = new ApiCache();
    cache.set('key1', 'data', -1000);
    expect(cache.get('key1')).toBeNull();
  });

  it('should not store entry with NaN TTL', () => {
    const cache = new ApiCache();
    cache.set('key1', 'data', NaN);
    expect(cache.get('key1')).toBeNull();
  });
});
