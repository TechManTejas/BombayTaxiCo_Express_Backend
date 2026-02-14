import {
  titleCase,
  formatDate,
} from '../utils/formatters';

describe('titleCase edge cases', () => {
  test('should handle numeric input without crashing', () => {
    // on base code, passing a number to titleCase crashes because !str is false for 0
    // but then String(str).trim() works, however the old code used !str which returns '' for 0
    expect(() => titleCase(123 as any)).not.toThrow();
  });

  test('should handle string with extra spaces', () => {
    // on base code, extra spaces between words create empty strings in split result
    // which causes empty capitalized words in the output
    const result = titleCase('hello   world');
    expect(result).toBe('Hello World');
    expect(result).not.toContain('  ');
  });

  test('should handle leading and trailing spaces', () => {
    const result = titleCase('  hello world  ');
    expect(result).toBe('Hello World');
  });

  test('still capitalizes normal strings', () => {
    expect(titleCase('hello world')).toBe('Hello World');
  });

  test('still handles single word', () => {
    expect(titleCase('hello')).toBe('Hello');
  });

  test('returns empty for null', () => {
    expect(titleCase(null)).toBe('');
  });

  test('returns empty for undefined', () => {
    expect(titleCase(undefined)).toBe('');
  });
});

describe('formatDate edge cases', () => {
  test('should handle numeric timestamp input', () => {
    // on base code, formatDate signature only accepts Date | string, not number
    // passing a timestamp number should work since new Date(number) is valid
    const timestamp = 1718409600000; // 2024-06-15 in ms
    const result = formatDate(timestamp as any);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('should handle zero timestamp', () => {
    const result = formatDate(0 as any);
    expect(result).toBe('1970-01-01');
  });

  test('still formats Date objects', () => {
    const date = new Date('2025-06-15T00:00:00Z');
    expect(formatDate(date)).toBe('2025-06-15');
  });

  test('still formats date strings', () => {
    expect(formatDate('2025-03-20')).toBe('2025-03-20');
  });

  test('returns empty for null', () => {
    expect(formatDate(null)).toBe('');
  });

  test('returns empty for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });
});
