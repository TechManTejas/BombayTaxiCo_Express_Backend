/**
 * API response utilities for consistent error handling and data formatting
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
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
  message: string = 'Operation completed successfully'
): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

/**
 * Creates a standardized error response
 */
export const createErrorResponse = (
  error: string,
  message: string = 'Operation failed'
): ApiResponse => {
  return {
    success: false,
    message,
    error,
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
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    success: true,
    message,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
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
  if (typeof input === 'string') {
    return input
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
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
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
  
  constructor(private maxRequests: number, private windowMs: number) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
    
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
}

/**
 * Cache utility for API responses
 */
export class ApiCache {
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  
  set(key: string, data: any, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
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
}
