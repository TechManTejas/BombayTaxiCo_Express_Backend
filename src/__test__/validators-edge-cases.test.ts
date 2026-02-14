import {
  isValidEmail,
  sanitizeString,
} from '../utils/validators';

describe('isValidEmail edge cases', () => {
  test('should handle numeric input without crashing', () => {
    // on base code, passing a number crashes because .trim() is called on number
    expect(() => isValidEmail(12345 as any)).not.toThrow();
    expect(isValidEmail(12345 as any)).toBe(false);
  });

  test('should handle boolean input without crashing', () => {
    expect(() => isValidEmail(true as any)).not.toThrow();
    expect(isValidEmail(true as any)).toBe(false);
  });

  test('should handle object input without crashing', () => {
    expect(() => isValidEmail({} as any)).not.toThrow();
    expect(isValidEmail({} as any)).toBe(false);
  });

  test('still validates correct emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  test('still rejects invalid emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('sanitizeString edge cases', () => {
  test('should escape single quotes to prevent XSS', () => {
    // on base code, single quotes are not escaped
    const result = sanitizeString("it's a test");
    expect(result).not.toContain("'");
    expect(result).toContain('&#x27;');
  });

  test('should escape single quotes in script context', () => {
    const result = sanitizeString("onclick='alert(1)'");
    expect(result).not.toContain("'");
  });

  test('still escapes angle brackets', () => {
    expect(sanitizeString('<div>')).toContain('&lt;');
    expect(sanitizeString('<div>')).toContain('&gt;');
  });

  test('still escapes double quotes', () => {
    expect(sanitizeString('"hello"')).toContain('&quot;');
  });

  test('still trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  test('returns empty for null', () => {
    expect(sanitizeString(null)).toBe('');
  });

  test('returns empty for undefined', () => {
    expect(sanitizeString(undefined)).toBe('');
  });
});
