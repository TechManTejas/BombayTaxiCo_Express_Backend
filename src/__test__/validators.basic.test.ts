import { isValidEmail, isValidPhone, isValidObjectId } from '../utils/validators';

describe('Validators Basic Tests', () => {
  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    it('should handle null', () => {
      expect(isValidEmail(null)).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone', () => {
      expect(isValidPhone('9876543210')).toBe(true);
    });

    it('should reject invalid phone', () => {
      expect(isValidPhone('12345')).toBe(false);
    });

    it('should handle null', () => {
      expect(isValidPhone(null)).toBe(false);
    });
  });

  describe('isValidObjectId', () => {
    it('should validate correct ObjectId', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
    });

    it('should reject invalid ObjectId', () => {
      expect(isValidObjectId('invalid')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(isValidObjectId('')).toBe(false);
    });
  });
});
