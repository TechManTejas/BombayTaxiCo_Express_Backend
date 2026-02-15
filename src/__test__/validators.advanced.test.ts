import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
} from '../utils/validators';

describe('Validators Edge Cases', () => {
  describe('validateEmail', () => {
    it('should handle email with subdomains', () => {
      expect(validateEmail('user@sub.domain.com')).toBe(true);
    });

    it('should handle email with numbers', () => {
      expect(validateEmail('user123@domain.com')).toBe(true);
    });

    it('should handle email with special characters', () => {
      expect(validateEmail('user.name+tag@domain.com')).toBe(true);
    });

    it('should reject email without domain', () => {
      expect(validateEmail('user@')).toBe(false);
    });

    it('should reject email without @', () => {
      expect(validateEmail('userdomain.com')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should handle phone numbers with country code', () => {
      expect(validatePhone('+919876543210')).toBe(true);
    });

    it('should handle phone numbers with spaces', () => {
      expect(validatePhone('98765 43210')).toBe(true);
    });

    it('should handle phone numbers with dashes', () => {
      expect(validatePhone('98765-43210')).toBe(true);
    });

    it('should reject too short numbers', () => {
      expect(validatePhone('12345')).toBe(false);
    });

    it('should reject too long numbers', () => {
      expect(validatePhone('123456789012345')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should handle whitespace only', () => {
      expect(validateRequired('   ')).toBe(false);
    });

    it('should handle newline only', () => {
      expect(validateRequired('\n')).toBe(false);
    });

    it('should handle tab only', () => {
      expect(validateRequired('\t')).toBe(false);
    });

    it('should handle mixed whitespace', () => {
      expect(validateRequired(' \n\t ')).toBe(false);
    });

    it('should accept single character', () => {
      expect(validateRequired('a')).toBe(true);
    });
  });

  describe('validateMinLength', () => {
    it('should handle exact length match', () => {
      expect(validateMinLength('hello', 5)).toBe(true);
    });

    it('should handle longer strings', () => {
      expect(validateMinLength('hello world', 5)).toBe(true);
    });

    it('should handle shorter strings', () => {
      expect(validateMinLength('hi', 5)).toBe(false);
    });

    it('should handle empty string', () => {
      expect(validateMinLength('', 5)).toBe(false);
    });

    it('should handle zero minimum', () => {
      expect(validateMinLength('hello', 0)).toBe(true);
    });
  });

  describe('validateMaxLength', () => {
    it('should handle exact length match', () => {
      expect(validateMaxLength('hello', 5)).toBe(true);
    });

    it('should handle shorter strings', () => {
      expect(validateMaxLength('hi', 5)).toBe(true);
    });

    it('should handle longer strings', () => {
      expect(validateMaxLength('hello world', 5)).toBe(false);
    });

    it('should handle empty string', () => {
      expect(validateMaxLength('', 5)).toBe(true);
    });

    it('should handle zero maximum', () => {
      expect(validateMaxLength('hello', 0)).toBe(false);
    });
  });
});
