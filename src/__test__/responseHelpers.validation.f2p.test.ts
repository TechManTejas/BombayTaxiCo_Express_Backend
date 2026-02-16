/**
 * Tests for validationErrorResponse robustness fix
 */
import { validationErrorResponse } from '../utils/responseHelpers';

describe('validationErrorResponse robustness', () => {
  it('should handle non-array input gracefully', () => {
    const result = validationErrorResponse('not-an-array' as any);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Validation failed');
  });

  it('should filter out empty strings from missing fields', () => {
    const result = validationErrorResponse(['name', '', 'email']);
    expect(result.errors).toEqual(['name is required', 'email is required']);
  });

  it('should filter out non-string entries', () => {
    const result = validationErrorResponse(['name', 123 as any, 'email']);
    expect(result.errors).toEqual(['name is required', 'email is required']);
  });

  it('should return validation failed if all entries are empty', () => {
    const result = validationErrorResponse(['', '  ', '']);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Validation failed');
  });
});
