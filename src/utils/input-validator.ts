/**
 * Simple Input Validator Utility
 * Basic input validation with common validation rules
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  alpha?: boolean;
  alphaNumeric?: boolean;
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export class InputValidator {
  private static instance: InputValidator;

  private constructor() {}

  static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator();
    }
    return InputValidator.instance;
  }

  validate(value: any, rules: ValidationRule): ValidationResult {
    const errors: string[] = [];

    // Required validation
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push('This field is required');
      return { isValid: false, errors };
    }

    // Skip other validations if value is empty and not required
    if (value === undefined || value === null || value === '') {
      return { isValid: true, errors: [] };
    }

    // Convert to string for most validations
    const stringValue = String(value);

    // Min length validation
    if (rules.minLength !== undefined && stringValue.length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength} characters`);
    }

    // Max length validation
    if (rules.maxLength !== undefined && stringValue.length > rules.maxLength) {
      errors.push(`Maximum length is ${rules.maxLength} characters`);
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      errors.push('Invalid format');
    }

    // Email validation
    if (rules.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(stringValue)) {
        errors.push('Invalid email address');
      }
    }

    // URL validation
    if (rules.url) {
      try {
        new URL(stringValue);
      } catch {
        errors.push('Invalid URL');
      }
    }

    // Numeric validation
    if (rules.numeric && !/^-?\d*\.?\d+$/.test(stringValue)) {
      errors.push('Must be a number');
    }

    // Alpha validation
    if (rules.alpha && !/^[a-zA-Z]+$/.test(stringValue)) {
      errors.push('Must contain only letters');
    }

    // Alpha numeric validation
    if (rules.alphaNumeric && !/^[a-zA-Z0-9]+$/.test(stringValue)) {
      errors.push('Must contain only letters and numbers');
    }

    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(value);
      if (customResult === false) {
        errors.push('Invalid value');
      } else if (typeof customResult === 'string') {
        errors.push(customResult);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateSchema(data: any, schema: ValidationSchema): ValidationResult {
    const allErrors: string[] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const result = this.validate(data[field], rules);
      if (!result.isValid) {
        allErrors.push(...result.errors.map(error => `${field}: ${error}`));
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }

  validateEmail(email: string): ValidationResult {
    return this.validate(email, { required: true, email: true });
  }

  validatePassword(password: string): ValidationResult {
    return this.validate(password, {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    });
  }

  validatePhone(phone: string): ValidationResult {
    return this.validate(phone, {
      required: true,
      pattern: /^\+?[\d\s\-\(\)]+$/
    });
  }

  validateUsername(username: string): ValidationResult {
    return this.validate(username, {
      required: true,
      minLength: 3,
      maxLength: 20,
      alphaNumeric: true
    });
  }

  validateRequired(value: any): ValidationResult {
    return this.validate(value, { required: true });
  }
}

// Export singleton instance
export const inputValidator = InputValidator.getInstance();

// Utility functions for common validations
export const isValidEmail = (email: string): boolean => {
  return inputValidator.validateEmail(email).isValid;
};

export const isValidPassword = (password: string): boolean => {
  return inputValidator.validatePassword(password).isValid;
};

export const isValidPhone = (phone: string): boolean => {
  return inputValidator.validatePhone(phone).isValid;
};

export const isValidUsername = (username: string): boolean => {
  return inputValidator.validateUsername(username).isValid;
};

// Predefined validation schemas
export const userRegistrationSchema: ValidationSchema = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    alphaNumeric: true
  },
  email: {
    required: true,
    email: true
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  phone: {
    required: false,
    pattern: /^\+?[\d\s\-\(\)]+$/
  }
};

export const userProfileSchema: ValidationSchema = {
  firstName: {
    required: true,
    minLength: 1,
    maxLength: 50,
    alpha: true
  },
  lastName: {
    required: true,
    minLength: 1,
    maxLength: 50,
    alpha: true
  },
  email: {
    required: true,
    email: true
  },
  phone: {
    required: false,
    pattern: /^\+?[\d\s\-\(\)]+$/
  },
  bio: {
    required: false,
    maxLength: 500
  }
};

export const bookingSchema: ValidationSchema = {
  pickupLocation: {
    required: true,
    minLength: 5
  },
  dropoffLocation: {
    required: true,
    minLength: 5
  },
  scheduledTime: {
    required: true,
    custom: (value: any) => {
      const date = new Date(value);
      return date instanceof Date && !isNaN(date.getTime()) && date > new Date();
    }
  },
  passengerCount: {
    required: true,
    numeric: true,
    custom: (value: any) => {
      const num = Number(value);
      return num > 0 && num <= 10;
    }
  }
};

// Express middleware helper
export const validateRequest = (schema: ValidationSchema) => {
  return (req: any, res: any, next: any) => {
    const result = inputValidator.validateSchema(req.body, schema);
    
    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: result.errors
      });
    }
    
    next();
  };
};

// Type guards
export const isValidationRule = (obj: any): obj is ValidationRule => {
  return typeof obj === 'object' && obj !== null;
};

export const isValidationSchema = (obj: any): obj is ValidationSchema => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  for (const key in obj) {
    if (!isValidationRule(obj[key])) {
      return false;
    }
  }
  
  return true;
};

// Error formatting utilities
export const formatValidationErrors = (errors: string[]): string => {
  return errors.join(', ');
};

export const getFirstValidationError = (errors: string[]): string | null => {
  return errors.length > 0 ? errors[0] : null;
};

// Validation rule builders
export const createRequiredRule = (message?: string): ValidationRule => ({
  required: true,
  custom: message ? () => message : undefined
});

export const createLengthRule = (min?: number, max?: number): ValidationRule => {
  const rule: ValidationRule = {};
  if (min !== undefined) rule.minLength = min;
  if (max !== undefined) rule.maxLength = max;
  return rule;
};

export const createPatternRule = (pattern: RegExp, message?: string): ValidationRule => ({
  pattern,
  custom: message ? () => message : undefined
});

export const createCustomRule = (validator: (value: any) => boolean | string): ValidationRule => ({
  custom: validator
});

// Common patterns
export const commonPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  username: /^[a-zA-Z0-9]+$/,
  slug: /^[a-z0-9-]+$/,
  hex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

// Sanitization utilities
export const sanitizeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

export const sanitizeNumber = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

export const sanitizeEmail = (value: any): string => {
  return sanitizeString(value).toLowerCase();
};

// Validation statistics
export const getValidationStats = (results: ValidationResult[]): {
  total: number;
  valid: number;
  invalid: number;
  errorRate: number;
} => {
  const total = results.length;
  const valid = results.filter(r => r.isValid).length;
  const invalid = total - valid;
  const errorRate = total > 0 ? (invalid / total) * 100 : 0;

  return { total, valid, invalid, errorRate };
};

// Batch validation
export const validateBatch = (
  dataArray: any[],
  schema: ValidationSchema
): ValidationResult[] => {
  return dataArray.map(data => inputValidator.validateSchema(data, schema));
};

// Async validation support
export const createAsyncValidator = (
  asyncValidator: (value: any) => Promise<boolean | string>
): (value: any) => Promise<boolean | string> => {
  return async (value: any) => {
    try {
      return await asyncValidator(value);
    } catch (error) {
      return 'Validation failed';
    }
  };
};
