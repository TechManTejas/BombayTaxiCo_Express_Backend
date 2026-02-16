/**
 * Tests for notFoundResponse whitespace trimming fix
 */
import { notFoundResponse } from '../utils/responseHelpers';

describe('notFoundResponse whitespace trimming', () => {
  it('should fall back to Resource for whitespace-only string', () => {
    const result = notFoundResponse('   ');
    expect(result.message).toBe('Resource not found');
  });

  it('should trim leading and trailing whitespace', () => {
    const result = notFoundResponse('  User  ');
    expect(result.message).toBe('User not found');
  });

  it('should fall back to Resource for empty string', () => {
    const result = notFoundResponse('');
    expect(result.message).toBe('Resource not found');
  });

  it('should still work normally for valid resource name', () => {
    const result = notFoundResponse('Booking');
    expect(result.message).toBe('Booking not found');
  });
});
