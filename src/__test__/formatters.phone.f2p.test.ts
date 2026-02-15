/**
 * Tests for formatPhone with country code prefix fixed in this change
 */
import { formatPhone } from '../utils/formatters';

describe('formatPhone with 91 country code prefix', () => {
  it('should format 12-digit number with 91 prefix', () => {
    const result = formatPhone('919876543210');
    expect(result).toBe('+91 98765-43210');
  });

  it('should format +91 prefixed number', () => {
    const result = formatPhone('+919876543210');
    expect(result).toBe('+91 98765-43210');
  });

  it('should format 91 with spaces', () => {
    const result = formatPhone('91 9876543210');
    expect(result).toBe('+91 98765-43210');
  });
});
