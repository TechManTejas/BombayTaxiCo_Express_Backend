import {
  formatPhone,
  formatINR,
  formatDate,
  formatBookingNumber,
  truncateString,
  titleCase,
  formatDistance,
} from '../utils/formatters';

describe('formatPhone', () => {
  test('formats 10 digit number with +91 prefix', () => {
    expect(formatPhone('9876543210')).toBe('+91 98765-43210');
  });

  test('returns original for non-10-digit number', () => {
    expect(formatPhone('12345')).toBe('12345');
  });

  test('returns empty for null', () => {
    expect(formatPhone(null)).toBe('');
  });

  test('returns empty for undefined', () => {
    expect(formatPhone(undefined)).toBe('');
  });

  test('handles numeric input without crashing', () => {
    expect(formatPhone(9876543210 as any)).toBe('+91 98765-43210');
  });
});

describe('formatINR', () => {
  test('formats a positive amount', () => {
    const result = formatINR(1500);
    expect(result).toContain('₹');
    expect(result).toContain('1');
  });

  test('returns ₹0 for null', () => {
    expect(formatINR(null)).toBe('₹0');
  });

  test('returns ₹0 for undefined', () => {
    expect(formatINR(undefined)).toBe('₹0');
  });

  test('returns ₹0 for NaN', () => {
    expect(formatINR(NaN)).toBe('₹0');
  });

  test('formats zero', () => {
    expect(formatINR(0)).toBe('₹0');
  });
});

describe('formatDate', () => {
  test('formats a Date object', () => {
    const date = new Date('2025-06-15T00:00:00Z');
    expect(formatDate(date)).toBe('2025-06-15');
  });

  test('formats a date string', () => {
    expect(formatDate('2025-03-20')).toBe('2025-03-20');
  });

  test('returns empty for null', () => {
    expect(formatDate(null)).toBe('');
  });

  test('returns empty for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  test('returns empty for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});

describe('formatBookingNumber', () => {
  test('formats with BTC prefix and padding', () => {
    expect(formatBookingNumber(42)).toBe('BTC-000042');
  });

  test('formats large number', () => {
    expect(formatBookingNumber(123456)).toBe('BTC-123456');
  });

  test('returns default for null', () => {
    expect(formatBookingNumber(null)).toBe('BTC-000000');
  });

  test('returns default for undefined', () => {
    expect(formatBookingNumber(undefined)).toBe('BTC-000000');
  });

  test('returns default for NaN', () => {
    expect(formatBookingNumber(NaN)).toBe('BTC-000000');
  });
});

describe('truncateString', () => {
  test('truncates long string', () => {
    expect(truncateString('Hello World', 8)).toBe('Hello...');
  });

  test('returns short string unchanged', () => {
    expect(truncateString('Hi', 10)).toBe('Hi');
  });

  test('returns empty for null', () => {
    expect(truncateString(null, 10)).toBe('');
  });

  test('returns empty for undefined', () => {
    expect(truncateString(undefined, 10)).toBe('');
  });

  test('returns empty for zero maxLen', () => {
    expect(truncateString('hello', 0)).toBe('');
  });

  test('returns empty for negative maxLen', () => {
    expect(truncateString('hello', -5)).toBe('');
  });
});

describe('titleCase', () => {
  test('capitalizes each word', () => {
    expect(titleCase('hello world')).toBe('Hello World');
  });

  test('handles single word', () => {
    expect(titleCase('hello')).toBe('Hello');
  });

  test('handles uppercase input', () => {
    expect(titleCase('HELLO WORLD')).toBe('Hello World');
  });

  test('returns empty for null', () => {
    expect(titleCase(null)).toBe('');
  });

  test('returns empty for undefined', () => {
    expect(titleCase(undefined)).toBe('');
  });

  test('returns empty for empty string', () => {
    expect(titleCase('')).toBe('');
  });
});

describe('formatDistance', () => {
  test('formats km value', () => {
    expect(formatDistance(45.5)).toBe('45.5 km');
  });

  test('returns 0 km for null', () => {
    expect(formatDistance(null)).toBe('0 km');
  });

  test('returns 0 km for undefined', () => {
    expect(formatDistance(undefined)).toBe('0 km');
  });

  test('returns 0 km for NaN', () => {
    expect(formatDistance(NaN)).toBe('0 km');
  });

  test('formats zero', () => {
    expect(formatDistance(0)).toBe('0.0 km');
  });
});
