/**
 * Tests for formatINR negative amount formatting fix
 */
import { formatINR } from '../utils/formatters';

describe('formatINR negative amount formatting', () => {
  it('should format negative amount with minus before rupee symbol', () => {
    const result = formatINR(-500);
    expect(result).toBe('-₹500');
  });

  it('should format large negative amount correctly', () => {
    const result = formatINR(-1500);
    expect(result).toMatch(/^-₹/);
  });

  it('should not have double negative signs', () => {
    const result = formatINR(-100);
    expect(result).not.toMatch(/--/);
    expect(result).toBe('-₹100');
  });
});
