/**
 * Tests for validateRequestData null/undefined requiredFields guard fix
 */
import { validateRequestData } from '../utils/api-response';

describe('validateRequestData requiredFields guard', () => {
  it('should return valid for null requiredFields', () => {
    const result = validateRequestData({ name: 'test' }, null as any);
    expect(result.isValid).toBe(true);
    expect(result.missingFields).toEqual([]);
  });

  it('should return valid for undefined requiredFields', () => {
    const result = validateRequestData({ name: 'test' }, undefined as any);
    expect(result.isValid).toBe(true);
    expect(result.missingFields).toEqual([]);
  });

  it('should return valid for empty requiredFields array', () => {
    const result = validateRequestData({ name: 'test' }, []);
    expect(result.isValid).toBe(true);
    expect(result.missingFields).toEqual([]);
  });

  it('should still validate normally with valid requiredFields', () => {
    const result = validateRequestData({ name: 'test' }, ['name', 'email']);
    expect(result.isValid).toBe(false);
    expect(result.missingFields).toContain('email');
  });
});
