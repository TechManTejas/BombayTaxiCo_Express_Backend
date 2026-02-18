/**
 * API response utilities for consistent error handling and data formatting
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  statusCode?: number;
  requestId?: string;
  version?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface DetailedError {
  code: string;
  message: string;
  details?: ValidationError[];
  stack?: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

/**
 * Creates a standardized success response
 */
export const createSuccessResponse = <T>(
  data: T,
  message: string = 'Operation completed successfully',
  statusCode: number = 200,
  options: { requestId?: string; version?: string } = {}
): ApiResponse<T> => {
  // Validate inputs
  if (typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Message must be a non-empty string');
  }
  
  if (typeof statusCode !== 'number' || statusCode < 200 || statusCode > 299) {
    throw new Error('Success status code must be between 200 and 299');
  }
  
  return {
    success: true,
    message: message.trim(),
    data,
    statusCode,
    requestId: options.requestId,
    version: options.version || '1.0.0',
    timestamp: new Date().toISOString()
  };
};

/**
 * Creates a standardized error response
 */
export const createErrorResponse = (
  error: string | DetailedError,
  message: string = 'Operation failed',
  statusCode: number = 500,
  options: { requestId?: string; version?: string; includeStack?: boolean } = {}
): ApiResponse => {
  // Validate inputs
  if (typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Message must be a non-empty string');
  }
  
  if (typeof statusCode !== 'number' || statusCode < 400 || statusCode > 599) {
    throw new Error('Error status code must be between 400 and 599');
  }
  
  let errorMessage: string;
  let errorDetails: ValidationError[] | undefined;
  
  if (typeof error === 'string') {
    errorMessage = error.trim();
  } else {
    errorMessage = error.message;
    errorDetails = error.details;
  }
  
  if (errorMessage.length === 0) {
    errorMessage = 'Unknown error occurred';
  }
  
  return {
    success: false,
    message: message.trim(),
    error: errorMessage,
    statusCode,
    requestId: options.requestId,
    version: options.version || '1.0.0',
    timestamp: new Date().toISOString()
  };
};

/**
 * Creates a paginated response with metadata
 */
export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  message: string = 'Data retrieved successfully'
): PaginatedResponse<T> => {
  const safePageSize = (typeof pageSize === 'number' && !isNaN(pageSize) && isFinite(pageSize) && pageSize > 0) ? pageSize : 10;
  const safeTotal = (typeof total === 'number' && !isNaN(total) && isFinite(total) && total >= 0) ? total : 0;
  const safePage = (typeof page === 'number' && !isNaN(page) && isFinite(page) && page > 0) ? page : 1;
  const totalPages = safePageSize > 0 ? Math.ceil(safeTotal / safePageSize) : 0;
  
  return {
    success: true,
    message,
    data,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total: safeTotal,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1
    },
    timestamp: new Date().toISOString()
  };
};

/**
 * Wraps async functions with error handling
 */
export const asyncHandler = <T extends (...args: any[]) => Promise<any>>(
  fn: T
): ((...args: Parameters<T>) => Promise<any>) => {
  return async (...args: Parameters<T>): Promise<any> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unexpected error occurred');
    }
  };
};

/**
 * Validates API request data
 */
export const validateRequestData = (
  data: any,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } => {
  if (!requiredFields || !Array.isArray(requiredFields) || requiredFields.length === 0) {
    return { isValid: true, missingFields: [] };
  }
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!data || data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Sanitizes user input to prevent XSS
 */
export const sanitizeInput = (input: any): any => {
  // Handle null/undefined inputs
  if (input === null || input === undefined) {
    return input;
  }
  
  if (typeof input === 'string') {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  if (typeof input === 'object' && input !== null) {
    // Handle special object types that should pass through
    if (input instanceof Date || input instanceof RegExp) {
      return input;
    }
    
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        // Skip circular references to prevent infinite recursion
        if (input[key] === input) {
          continue;
        }
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  
  return input;
};

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  
  constructor(private maxRequests: number, private windowMs: number) {
    // Handle invalid parameters
    this.maxRequests = Math.max(1, this.maxRequests || 5);
    this.windowMs = Math.max(0, this.windowMs || 60000);
    
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
    
    // Always update the map with cleaned entries
    this.requests.set(identifier, validRequests);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
  
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, requests] of this.requests) {
      const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
  
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

/**
 * Cache utility for API responses
 */
export class ApiCache {
  private cache: Map<string, { data: any; expiry: number; accessCount: number }> = new Map();
  private maxEntries: number;
  
  constructor(maxEntries: number = 1000) {
    this.maxEntries = maxEntries;
  }
  
  set(key: string, data: any, ttlMs: number): void {
    if (!ttlMs || ttlMs <= 0 || isNaN(ttlMs) || !isFinite(ttlMs)) return;
    
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxEntries) {
      this.evictLeastRecentlyUsed();
    }
    
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
      accessCount: 0
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access count for LRU
    item.accessCount++;
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  size(): number {
    const now = Date.now();
    let count = 0;
    for (const [key, item] of this.cache) {
      if (now <= item.expiry) {
        count++;
      } else {
        this.cache.delete(key);
      }
    }
    return count;
  }
  
  private evictLeastRecentlyUsed(): void {
    let leastUsedKey: string | null = null;
    let minAccessCount = Infinity;
    
    for (const [key, item] of this.cache) {
      if (item.accessCount < minAccessCount) {
        minAccessCount = item.accessCount;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }
}

/**
 * Request ID generator for tracking API requests
 */
export class RequestIdGenerator {
  private static counter = 0;
  
  static generate(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const count = (++this.counter).toString(36);
    return `${timestamp}-${random}-${count}`;
  }
}

/**
 * Response time tracker
 */
export class ResponseTimeTracker {
  private startTime: number;
  
  constructor() {
    this.startTime = Date.now();
  }
  
  getDuration(): number {
    return Date.now() - this.startTime;
  }
  
  getDurationMs(): string {
    return `${this.getDuration()}ms`;
  }
}

/**
 * Data transformer utility
 */
export const transformData = <T, R>(
  data: T[],
  transformer: (item: T) => R,
  options: { filter?: (item: T) => boolean; sort?: (a: T, b: T) => number } = {}
): R[] => {
  let result = data;
  
  if (options.filter) {
    result = result.filter(options.filter);
  }
  
  if (options.sort) {
    result = [...result].sort(options.sort);
  }
  
  return result.map(transformer);
};

/**
 * Field validator utility
 */
export const validateField = (
  value: any,
  rules: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
  }
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required validation
  if (rules.required && (value === undefined || value === null || value === '')) {
    errors.push('Field is required');
    return { isValid: false, errors };
  }
  
  // Skip further validation if field is optional and empty
  if (!rules.required && (value === undefined || value === null || value === '')) {
    return { isValid: true, errors: [] };
  }
  
  // Type validation
  if (rules.type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rules.type) {
      errors.push(`Expected type ${rules.type}, got ${actualType}`);
    }
  }
  
  // String validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength}`);
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`Maximum length is ${rules.maxLength}`);
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push('Invalid format');
    }
  }
  
  // Number validations
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`Minimum value is ${rules.min}`);
    }
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`Maximum value is ${rules.max}`);
    }
  }
  
  // Enum validation
  if (rules.enum && !rules.enum.includes(value)) {
    errors.push(`Value must be one of: ${rules.enum.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
