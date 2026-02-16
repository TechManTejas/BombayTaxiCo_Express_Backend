/**
 * Tests for isValidEmail consecutive dots fix
 */
import { isValidEmail } from '../utils/validators';

describe('isValidEmail consecutive dots rejection', () => {
  it('should reject email with consecutive dots in domain', () => {
    expect(isValidEmail('user@test..com')).toBe(false);
  });

  it('should reject email with consecutive dots in local part', () => {
    expect(isValidEmail('user..name@test.com')).toBe(false);
  });

  it('should reject email with triple dots', () => {
    expect(isValidEmail('user@test...com')).toBe(false);
  });

  it('should still accept valid email with single dots', () => {
    expect(isValidEmail('user.name@test.co.in')).toBe(true);
  });
});
