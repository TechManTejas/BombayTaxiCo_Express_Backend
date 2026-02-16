import {
  getErrorMessage,
} from '../utils/responseHelpers';

describe('getErrorMessage edge cases', () => {
  test('should extract message from plain object with message property', () => {
    // on base code, plain objects with message property return default message
    // because only Error instances and strings are handled
    const axiosLikeError = { message: 'Request failed', status: 500 };
    expect(getErrorMessage(axiosLikeError)).toBe('Request failed');
  });

  test('should extract message from mongoose-like error object', () => {
    const mongoError = { message: 'Validation failed', name: 'ValidationError' };
    expect(getErrorMessage(mongoError)).toBe('Validation failed');
  });

  test('still handles Error instances', () => {
    expect(getErrorMessage(new Error('test error'))).toBe('test error');
  });

  test('still handles string errors', () => {
    expect(getErrorMessage('something failed')).toBe('something failed');
  });

  test('returns default for number', () => {
    expect(getErrorMessage(42)).toBe('42');
  });

  test('returns default for null', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred');
  });

  test('returns default for undefined', () => {
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
  });

  test('returns default for object without message', () => {
    expect(getErrorMessage({ code: 500 })).toBe('An unexpected error occurred');
  });

  test('returns default for object with non-string message', () => {
    expect(getErrorMessage({ message: 123 })).toBe('An unexpected error occurred');
  });
});
