import {
  validateData,
  commonRules,
  validateBookingData,
  validateUserRegistration,
  validateUserLogin,
  ValidationResult,
  ValidationRule
} from '../utils/validation';

describe('Validation Utilities', () => {
  describe('validateData', () => {
    it('should validate data with all rules passing', () => {
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string', minLength: 2 },
        { field: 'age', required: true, type: 'number', min: 18 }
      ];
      
      const data = { name: 'John', age: 25 };
      const result = validateData(data, rules);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should collect all validation errors', () => {
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string', minLength: 5 },
        { field: 'age', required: true, type: 'number', min: 18 },
        { field: 'email', required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      ];
      
      const data = { name: 'Jo', age: 16, email: 'invalid-email' };
      const result = validateData(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toContain('name must be at least 5 characters long');
      expect(result.errors.age).toContain('age must be at least 18');
      expect(result.errors.email).toContain('email format is invalid');
    });

    it('should handle optional fields', () => {
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string' },
        { field: 'age', required: false, type: 'number', min: 18 }
      ];
      
      const data = { name: 'John' };
      const result = validateData(data, rules);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate array types', () => {
      const rules: ValidationRule[] = [
        { field: 'tags', required: true, type: 'array', minLength: 1, maxLength: 5 }
      ];
      
      const data = { tags: ['tag1', 'tag2', 'tag3'] };
      const result = validateData(data, rules);
      
      expect(result.isValid).toBe(true);
    });

    it('should validate object types', () => {
      const rules: ValidationRule[] = [
        { field: 'address', required: true, type: 'object' }
      ];
      
      const data = { address: { street: '123 Main St', city: 'Anytown' } };
      const result = validateData(data, rules);
      
      expect(result.isValid).toBe(true);
    });

    it('should handle custom validation', () => {
      const rules: ValidationRule[] = [
        {
          field: 'password',
          required: true,
          type: 'string',
          custom: (value: string) => value.length >= 8 || 'Password too short'
        }
      ];
      
      const data = { password: 'short' };
      const result = validateData(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toContain('Password too short');
    });
  });

  describe('commonRules', () => {
    describe('email rule', () => {
      it('should validate correct email', () => {
        const result = validateData({ email: 'test@example.com' }, [commonRules.email]);
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid email', () => {
        const result = validateData({ email: 'invalid-email' }, [commonRules.email]);
        expect(result.isValid).toBe(false);
        expect(result.errors.email).toContain('email format is invalid');
      });

      it('should reject too long email', () => {
        const longEmail = 'a'.repeat(250) + '@example.com';
        const result = validateData({ email: longEmail }, [commonRules.email]);
        expect(result.isValid).toBe(false);
        expect(result.errors.email).toContain('Email address is too long');
      });
    });

    describe('password rule', () => {
      it('should validate strong password', () => {
        const result = validateData({ password: 'StrongP@ss123' }, [commonRules.password]);
        expect(result.isValid).toBe(true);
      });

      it('should reject weak password', () => {
        const result = validateData({ password: 'weak' }, [commonRules.password]);
        expect(result.isValid).toBe(false);
        expect(result.errors.password.length).toBeGreaterThan(0);
      });
    });

    describe('phone rule', () => {
      it('should validate correct phone', () => {
        const result = validateData({ phone: '9876543210' }, [commonRules.phone]);
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid phone', () => {
        const result = validateData({ phone: '12345' }, [commonRules.phone]);
        expect(result.isValid).toBe(false);
        expect(result.errors.phone).toContain('Phone number must be exactly 10 digits');
      });
    });

    describe('name rule', () => {
      it('should validate correct name', () => {
        const result = validateData({ name: 'John Doe' }, [commonRules.name]);
        expect(result.isValid).toBe(true);
      });

      it('should reject name with numbers', () => {
        const result = validateData({ name: 'John123' }, [commonRules.name]);
        expect(result.isValid).toBe(false);
        expect(result.errors.name).toContain('name format is invalid');
      });
    });

    describe('objectId rule', () => {
      it('should validate correct ObjectId', () => {
        const result = validateData({ id: '507f1f77bcf86cd799439011' }, [commonRules.objectId]);
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid ObjectId', () => {
        const result = validateData({ id: 'invalid-id' }, [commonRules.objectId]);
        expect(result.isValid).toBe(false);
        expect(result.errors.id).toContain('id format is invalid');
      });
    });
  });

  describe('validateBookingData', () => {
    it('should validate complete booking data', () => {
      const bookingData = {
        pickupLocation: '19.0760,72.8777 Mumbai, Maharashtra',
        dropoffLocation: '28.6139,77.2090 Delhi, NCR',
        scheduledTime: '2025-12-25T10:30:00.000Z',
        vehicleType: 'sedan',
        estimatedDistance: 150.5,
        estimatedDuration: 120,
        specialRequests: 'Extra luggage space'
      };
      
      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject booking with invalid locations', () => {
      const bookingData = {
        pickupLocation: 'Mumbai', // Missing coordinates
        dropoffLocation: 'Delhi', // Missing coordinates
        scheduledTime: '2025-12-25T10:30:00.000Z',
        vehicleType: 'sedan'
      };
      
      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(false);
      expect(result.errors.pickupLocation).toContain('Pickup location must include coordinates');
      expect(result.errors.dropoffLocation).toContain('Dropoff location must include coordinates');
    });

    it('should reject booking with past scheduled time', () => {
      const bookingData = {
        pickupLocation: '19.0760,72.8777 Mumbai, Maharashtra',
        dropoffLocation: '28.6139,77.2090 Delhi, NCR',
        scheduledTime: '2020-01-01T10:30:00.000Z', // Past date
        vehicleType: 'sedan'
      };
      
      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(false);
      expect(result.errors.scheduledTime).toContain('Scheduled time must be a valid future date');
    });

    it('should reject booking with invalid vehicle type', () => {
      const bookingData = {
        pickupLocation: '19.0760,72.8777 Mumbai, Maharashtra',
        dropoffLocation: '28.6139,77.2090 Delhi, NCR',
        scheduledTime: '2025-12-25T10:30:00.000Z',
        vehicleType: 'spaceship' // Invalid type
      };
      
      const result = validateBookingData(bookingData);
      expect(result.isValid).toBe(false);
      expect(result.errors.vehicleType).toContain('Invalid vehicle type');
    });
  });

  describe('validateUserRegistration', () => {
    it('should validate complete registration data', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: 'StrongP@ss123',
        confirmPassword: 'StrongP@ss123'
      };
      
      const result = validateUserRegistration(userData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject registration with mismatched passwords', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: 'StrongP@ss123',
        confirmPassword: 'DifferentPass123'
      };
      
      const result = validateUserRegistration(userData);
      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toContain('Passwords do not match');
    });

    it('should reject registration with weak password', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: 'weak',
        confirmPassword: 'weak'
      };
      
      const result = validateUserRegistration(userData);
      expect(result.isValid).toBe(false);
      expect(result.errors.password.length).toBeGreaterThan(0);
    });
  });

  describe('validateUserLogin', () => {
    it('should valid login credentials', () => {
      const loginData = {
        email: 'john@example.com',
        password: 'anypassword'
      };
      
      const result = validateUserLogin(loginData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject login with invalid email', () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123'
      };
      
      const result = validateUserLogin(loginData);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toContain('email format is invalid');
    });

    it('should reject login with missing password', () => {
      const loginData = {
        email: 'john@example.com',
        password: ''
      };
      
      const result = validateUserLogin(loginData);
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toContain('password is required');
    });

    it('should reject login with missing email', () => {
      const loginData = {
        password: 'password123'
      };
      
      const result = validateUserLogin(loginData);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toContain('email is required');
    });
  });
});
