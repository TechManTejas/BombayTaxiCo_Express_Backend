/**
 * Enhanced data validation utilities for API endpoints with advanced features.
 */

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'email' | 'url' | 'phone';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any, allData?: any) => boolean | string;
  sanitize?: boolean;
  transform?: (value: any) => any;
  conditional?: (value: any, allData?: any) => boolean;
  items?: ValidationRule[];
  properties?: Record<string, ValidationRule>;
  requiredKeys?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  sanitizedData?: any;
  metadata?: Record<string, any>;
}

export interface ValidationContext {
  requestId?: string;
  userId?: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

export interface ValidationConfig {
  enableSanitization?: boolean;
  enableTransform?: boolean;
  enableConditionalValidation?: boolean;
  strictMode?: boolean;
  customValidators?: Record<string, (value: any, allData?: any) => boolean | string>;
}

export interface FieldError {
  code: string;
  message: string;
  field: string;
  value?: any;
  path?: string;
  severity: 'error' | 'warning' | 'info';
  metadata?: Record<string, any>;
}

/**
 * Enhanced data validation with advanced features
 */
export const validateData = (
  data: any, 
  rules: ValidationRule[], 
  config: ValidationConfig = {},
  context?: ValidationContext
): ValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};
  const metadata: Record<string, any> = {};
  let sanitizedData = { ...data };
  
  for (const rule of rules) {
    const fieldErrors: string[] = [];
    const fieldWarnings: string[] = [];
    const value = data[rule.field];
    
    // Conditional validation
    if (config.enableConditionalValidation && rule.conditional) {
      const shouldValidate = rule.conditional(value, data);
      if (!shouldValidate) {
        continue;
      }
    }
    
    // Transform value if transform function is provided
    let transformedValue = value;
    if (config.enableTransform && rule.transform) {
      try {
        transformedValue = rule.transform(value);
      } catch (error) {
        fieldErrors.push(`Failed to transform ${rule.field}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errors[rule.field] = fieldErrors;
        continue;
      }
    }
    
    // Check if required field is missing
    if (rule.required && (transformedValue === undefined || transformedValue === null || transformedValue === '')) {
      fieldErrors.push(`${rule.field} is required`);
      errors[rule.field] = fieldErrors;
      continue;
    }
    
    // Skip other validations if field is not required and empty
    if (!rule.required && (transformedValue === undefined || transformedValue === null || transformedValue === '')) {
      continue;
    }
    
    // Type validation
    if (rule.type) {
      const actualType = Array.isArray(transformedValue) ? 'array' : typeof transformedValue;
      if (actualType !== rule.type) {
        fieldErrors.push(`${rule.field} must be of type ${rule.type}`);
      }
    }
    
    // Enhanced string validations
    if (typeof transformedValue === 'string') {
      if (rule.minLength !== undefined && transformedValue.length < rule.minLength) {
        fieldErrors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
      }
      
      if (rule.maxLength !== undefined && rule.maxLength > 0 && transformedValue.length > rule.maxLength) {
        fieldErrors.push(`${rule.field} must not exceed ${rule.maxLength} characters`);
      }
      
      if (rule.pattern && !rule.pattern.test(transformedValue)) {
        fieldErrors.push(`${rule.field} format is invalid`);
      }
      
      // Email validation
      if (rule.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(transformedValue)) {
          fieldErrors.push(`${rule.field} must be a valid email address`);
        }
      }
      
      // URL validation
      if (rule.type === 'url') {
        try {
          new URL(transformedValue);
        } catch {
          fieldErrors.push(`${rule.field} must be a valid URL`);
        }
      }
      
      // Phone validation
      if (rule.type === 'phone') {
        const phoneRegex = /^[+]?[\d\s\-\(\)]?\d+$/;
        if (!phoneRegex.test(transformedValue)) {
          fieldWarnings.push(`${rule.field} may not be a valid phone number`);
        }
      }
      
      // Date validation
      if (rule.type === 'date') {
        const date = new Date(transformedValue);
        if (isNaN(date.getTime())) {
          fieldErrors.push(`${rule.field} must be a valid date`);
        }
      }
    }
    
    // Enhanced number validations
    if (typeof transformedValue === 'number') {
      if (rule.min !== undefined && transformedValue < rule.min) {
        fieldErrors.push(`${rule.field} must be at least ${rule.min}`);
      }
      
      if (rule.max !== undefined && transformedValue > rule.max) {
        fieldErrors.push(`${rule.field} must not exceed ${rule.max}`);
      }
      
      // Check for NaN and Infinity
      if (!isFinite(transformedValue)) {
        fieldErrors.push(`${rule.field} must be a finite number`);
      }
    }
    
    // Array validations
    if (Array.isArray(transformedValue)) {
      if (rule.minLength !== undefined && transformedValue.length < rule.minLength) {
        fieldErrors.push(`${rule.field} must contain at least ${rule.minLength} items`);
      }
      
      if (rule.maxLength !== undefined && rule.maxLength > 0 && transformedValue.length > rule.maxLength) {
        fieldErrors.push(`${rule.field} must not exceed ${rule.maxLength} items`);
      }
      
      // Validate array items if specified
      if (rule.items) {
        for (let i = 0; i < transformedValue.length; i++) {
          const itemErrors = validateData(
            { [rule.field]: transformedValue[i] },
            rule.items
          );
          if (!itemErrors.isValid) {
            fieldErrors.push(`${rule.field}[${i}]: ${Object.values(itemErrors.errors).flat().join(', ')}`);
          }
        }
      }
    }
    
    // Object validations
    if (rule.type === 'object' && transformedValue !== null && typeof transformedValue === 'object') {
      if (rule.properties) {
        const objectErrors = validateObject(transformedValue, rule.properties);
        if (!objectErrors.isValid) {
          fieldErrors.push(`${rule.field}: ${Object.values(objectErrors.errors).flat().join(', ')}`);
        }
      }
      
      if (rule.requiredKeys) {
        const missingKeys = rule.requiredKeys.filter(key => !(key in transformedValue));
        if (missingKeys.length > 0) {
          fieldErrors.push(`${rule.field} missing required keys: ${missingKeys.join(', ')}`);
        }
      }
    }
    
    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(transformedValue, data);
      if (customResult !== true) {
        const errorMessage = typeof customResult === 'string' ? customResult : `${rule.field} is invalid`;
        if (config.strictMode) {
          fieldErrors.push(errorMessage);
        } else {
          fieldWarnings.push(errorMessage);
        }
      }
    }
    
    // Sanitization
    if (config.enableSanitization && rule.sanitize) {
      sanitizedData[rule.field] = sanitizeString(transformedValue);
    } else {
      sanitizedData[rule.field] = transformedValue;
    }
    
    if (fieldErrors.length > 0) {
      errors[rule.field] = fieldErrors;
    }
    
    if (fieldWarnings.length > 0) {
      warnings[rule.field] = fieldWarnings;
    }
    
    // Add metadata
    metadata[rule.field] = {
      type: rule.type,
      required: rule.required,
      validated: true
    };
  }
  
  return {
    isValid: Object.keys(errors).length === 0 && Object.keys(warnings).length === 0,
    errors,
    warnings,
    sanitizedData,
    metadata
  };
};

/**
 * Validates object properties recursively
 */
export const validateObject = (
  obj: any,
  properties: Record<string, ValidationRule>
): ValidationResult => {
  const errors: Record<string, string[]> = {};
  
  for (const [key, rule] of Object.entries(properties)) {
    const value = obj[key];
    const fieldErrors: string[] = [];
    
    if (rule.required && (value === undefined || value === null || value === '')) {
      fieldErrors.push(`${key} is required`);
      errors[key] = fieldErrors;
      continue;
    }
    
    if (rule.type === 'object' && value !== null && typeof value === 'object') {
      const nestedErrors = validateObject(value, rule.properties || {});
      if (!nestedErrors.isValid) {
        errors[key] = [Object.values(nestedErrors.errors).flat().join(', ')];
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[key] = fieldErrors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: {}
  };
};

/**
 * Sanitizes string input to prevent XSS and injection attacks
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
      return input;
    }
  
  return input
    .replace(/<\/script>/gi, '&lt;/script&gt;')
    .replace(/<iframe/gi, '&lt;iframe&gt;')
    .replace(/<object/gi, '&lt;object&gt;')
    .replace(/<embed/gi, '&lt;embed&gt;')
    .replace(/javascript:/gi, 'javascript:')
    .replace(/vbscript:/gi, 'vbscript:')
    .replace(/onload=/gi, 'onload=')
    .replace(/onerror=/gi, 'onerror=')
    .replace(/onclick=/gi, 'onclick=')
    .replace(/onmouseover=/gi, 'onmouseover=')
    .replace(/onfocus=/gi, 'onfocus=')
    .trim();
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
  if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }
    
  if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
  return obj;
};

/**
 * Validates and transforms data with context
 */
export const validateWithContext = (
  data: any,
  rules: ValidationRule[],
  context: ValidationContext
): ValidationResult => {
  const config: ValidationConfig = {
    enableSanitization: true,
    enableTransform: true,
    enableConditionalValidation: true,
    strictMode: false,
    ...context
  };
  
  return validateData(data, rules, config, context);
};

/**
 * Batch validation for multiple datasets
 */
export const validateBatch = (
  datasets: Array<{ data: any; rules: ValidationRule[]; context?: ValidationContext }>
): ValidationResult[] => {
  return datasets.map(({ data, rules, context }) => 
    validateData(data, rules, {}, context)
  );
};

/**
 * Create validation error with detailed information
 */
export const createValidationError = (
  field: string,
  code: string,
  message: string,
  value?: any,
  path?: string,
  severity: 'error' | 'warning' | 'info' = 'error'
): FieldError => {
  return {
    code,
    message,
    field,
    value,
    path,
    severity
  };
};

/**
 * Format validation errors for API responses
 */
export const formatValidationErrors = (errors: Record<string, string[]>): Record<string, string[]> => {
  const formatted: Record<string, string[]> = {};
  
  for (const [field, messages] of Object.entries(errors)) {
      formatted[field] = messages;
    }
    
  return formatted;
};

/**
 * Get validation statistics
 */
export const getValidationStats = (
  results: ValidationResult[]
): {
  total: number;
  passed: number;
  failed: number;
  errorRate: number;
  commonErrors: Record<string, number>;
} => {
  const total = results.length;
  const passed = results.filter(r => r.isValid).length;
  const failed = total - passed;
  const errorRate = total > 0 ? (failed / total) * 100 : 0;
  
  const commonErrors: Record<string, number> = {};
  
  for (const result of results) {
    for (const [field, messages] of Object.entries(result.errors)) {
      commonErrors[field] = (commonErrors[field] || 0) + 1;
    }
  }
  
  return {
    total,
    passed,
    failed,
    errorRate,
    commonErrors
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
        return (!isNaN(date.getTime()) && date > new Date()) || 'Scheduled time must be a valid future date';
      }
    },
    {
      field: 'vehicleType',
      required: true,
      type: 'string',
      pattern: /^(sedan|suv|hatchback|luxury|bike)$/,
      custom: (value: string) => ['sedan', 'suv', 'hatchback', 'luxury', 'bike'].includes(value.trim()) || 'Invalid vehicle type'
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
