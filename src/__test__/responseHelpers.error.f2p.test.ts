/**
 * Tests for getErrorMessage handling of null, number, and empty string inputs
 */
import { getErrorMessage } from '../utils/responseHelpers';

describe('getErrorMessage extended type handling', () => {
  it('should return default message for null', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred');
  });

  it('should return default message for undefined', () => {
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
  });

  it('should convert number errors to string', () => {
    expect(getErrorMessage(404)).toBe('404');
  });

  it('should convert zero to string', () => {
    expect(getErrorMessage(0)).toBe('0');
  });

  it('should return default for empty string', () => {
    expect(getErrorMessage('')).toBe('An unexpected error occurred');
  });
});
