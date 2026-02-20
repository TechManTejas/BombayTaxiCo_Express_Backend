/**
 * Error Handler Utility
 * Centralized error handling and logging
 */

export interface ErrorInfo {
  message: string;
  code?: string;
  stack?: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: ErrorInfo[] = [];
  private maxErrors: number = 100;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error | string, context?: Record<string, any>): ErrorInfo {
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      code: this.extractErrorCode(error),
      stack: typeof error === 'string' ? undefined : error.stack,
      timestamp: new Date().toISOString(),
      context,
      userId: context?.userId,
      requestId: context?.requestId
    };

    this.logError(errorInfo);
    return errorInfo;
  }

  private extractErrorCode(error: Error | string): string | undefined {
    if (typeof error === 'string') {
      return 'GENERIC_ERROR';
    }

    if (error.name) {
      return error.name.toUpperCase();
    }

    return undefined;
  }

  private logError(errorInfo: ErrorInfo): void {
    this.errors.push(errorInfo);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorInfo);
    }
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  getErrorsByCode(code: string): ErrorInfo[] {
    return this.errors.filter(error => error.code === code);
  }

  getErrorsByTimeRange(startTime: Date, endTime: Date): ErrorInfo[] {
    return this.errors.filter(error => {
      const errorTime = new Date(error.timestamp);
      return errorTime >= startTime && errorTime <= endTime;
    });
  }

  clearErrors(): void {
    this.errors = [];
  }

  getErrorStats() {
    const total = this.errors.length;
    const byCode = this.errors.reduce((acc, error) => {
      const code = error.code || 'UNKNOWN';
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byCode,
      mostRecent: this.errors[this.errors.length - 1]?.timestamp || null
    };
  }

  createError(message: string, code?: string): Error {
    const error = new Error(message);
    if (code) {
      (error as any).code = code;
    }
    return error;
  }

  isCriticalError(error: ErrorInfo): boolean {
    const criticalCodes = ['SYSTEM_ERROR', 'DATABASE_ERROR', 'SECURITY_ERROR'];
    return criticalCodes.includes(error.code || '');
  }

  getCriticalErrors(): ErrorInfo[] {
    return this.errors.filter(error => this.isCriticalError(error));
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Error types
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string = 'Database operation failed') {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Utility function for async error handling
export function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  return fn().catch((error: unknown) => {
    errorHandler.handleError(error as Error | string, context);
    throw error;
  });
}

// Utility function for sync error handling
export function withSyncErrorHandling<T>(
  fn: () => T,
  context?: Record<string, any>
): T {
  try {
    return fn();
  } catch (error: unknown) {
    errorHandler.handleError(error as Error | string, context);
    throw error;
  }
}
