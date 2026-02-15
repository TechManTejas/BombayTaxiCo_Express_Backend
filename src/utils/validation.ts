/**
 * Data validation utilities for API endpoints
 */

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any, allData?: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

/**
 * Validates data against a set of rules
 */
export const validateData = (data: any, rules: ValidationRule[]): ValidationResult => {
  const errors: Record<string, string[]> = {};
  
  for (const rule of rules) {
    const fieldErrors: string[] = [];
    const value = data[rule.field];
    
    // Check if required field is missing
    if (rule.required && (value === undefined || value === null || value === '')) {
      fieldErrors.push(`${rule.field} is required`);
    }
    
    // Skip other validations if field is not required and empty
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Type validation
    if (rule.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rule.type) {
        fieldErrors.push(`${rule.field} must be of type ${rule.type}`);
      }
    }
    
    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        fieldErrors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        fieldErrors.push(`${rule.field} must not exceed ${rule.maxLength} characters`);
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        fieldErrors.push(`${rule.field} format is invalid`);
      }
    }
    
    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        fieldErrors.push(`${rule.field} must be at least ${rule.min}`);
      }
      
      if (rule.max !== undefined && value > rule.max) {
        fieldErrors.push(`${rule.field} must not exceed ${rule.max}`);
      }
    }
    
    // Array validations
    if (Array.isArray(value)) {
      if (rule.minLength && value.length < rule.minLength) {
        fieldErrors.push(`${rule.field} must contain at least ${rule.minLength} items`);
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        fieldErrors.push(`${rule.field} must not exceed ${rule.maxLength} items`);
      }
    }
    
    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value, data);
      if (customResult !== true) {
        fieldErrors.push(typeof customResult === 'string' ? customResult : `${rule.field} is invalid`);
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[rule.field] = fieldErrors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Common validation rules
 */
export const commonRules = {
  email: {
    field: 'email',
    required: true,
    type: 'string' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => value.length <= 255 || 'Email address is too long'
  },
  
  password: {
    field: 'password',
    required: true,
    type: 'string' as const,
    minLength: 8,
    maxLength: 128,
    custom: (value: string) => {
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
      
      if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
      if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
      if (!hasNumbers) return 'Password must contain at least one number';
      if (!hasSpecialChar) return 'Password must contain at least one special character';
      
      return true;
    }
  },
  
  phone: {
    field: 'phone',
    required: false,
    type: 'string' as const,
    pattern: /^[6-9]\d{9}$/,
    custom: (value: string) => value.length === 10 || 'Phone number must be exactly 10 digits'
  },
  
  name: {
    field: 'name',
    required: true,
    type: 'string' as const,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s]+$/,
    custom: (value: string) => value.trim().length >= 2 || 'Name must contain at least 2 characters'
  },
  
  objectId: {
    field: 'id',
    required: true,
    type: 'string' as const,
    pattern: /^[0-9a-fA-F]{24}$/
  }
};

/**
 * Validates booking data
 */
export const validateBookingData = (data: any): ValidationResult => {
  const rules: ValidationRule[] = [
    {
      field: 'pickupLocation',
      required: true,
      type: 'string',
      minLength: 5,
      maxLength: 500,
      custom: (value: string) => {
        const hasCoordinates = /\d+\.\d+,\s*\d+\.\d+/.test(value);
        return hasCoordinates || 'Pickup location must include coordinates';
      }
    },
    {
      field: 'dropoffLocation',
      required: true,
      type: 'string',
      minLength: 5,
      maxLength: 500,
      custom: (value: string) => {
        const hasCoordinates = /\d+\.\d+,\s*\d+\.\d+/.test(value);
        return hasCoordinates || 'Dropoff location must include coordinates';
      }
    },
    {
      field: 'scheduledTime',
      required: true,
      type: 'string',
      custom: (value: string) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) && date > new Date() || 'Scheduled time must be a valid future date';
      }
    },
    {
      field: 'vehicleType',
      required: true,
      type: 'string',
      pattern: /^(sedan|suv|hatchback|luxury|bike)$/,
      custom: (value: string) => ['sedan', 'suv', 'hatchback', 'luxury', 'bike'].includes(value) || 'Invalid vehicle type'
    }
  ];
  
  return validateData(data, rules);
};

/**
 * Validates user registration data
 */
export const validateUserRegistration = (data: any): ValidationResult => {
  const rules: ValidationRule[] = [
    commonRules.name,
    commonRules.email,
    commonRules.phone,
    commonRules.password,
    {
      field: 'confirmPassword',
      required: true,
      type: 'string',
      custom: (value: string, allData: any) => {
        return value === allData.password || 'Passwords do not match';
      }
    }
  ];
  
  return validateData(data, rules);
};

/**
 * Validates user login data
 */
export const validateUserLogin = (data: any): ValidationResult => {
  const rules: ValidationRule[] = [
    {
      field: 'email',
      required: true,
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    {
      field: 'password',
      required: true,
      type: 'string',
      minLength: 1
    }
  ];
  
  return validateData(data, rules);
};
