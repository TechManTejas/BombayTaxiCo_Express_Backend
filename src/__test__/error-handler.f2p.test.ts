/**
 * F2P tests for error handler utility.
 * These tests would fail on the base branch and pass after the fixes.
 */

import { 
  ErrorHandler, 
  errorHandler, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  DatabaseError,
  withErrorHandling,
  withSyncErrorHandling,
  ErrorInfo 
} from '../utils/error-handler';

describe('Error Handler F2P Tests', () => {
  beforeEach(() => {
    errorHandler.clearErrors();
  });

  describe('ErrorHandler class', () => {
    it('should be a singleton', () => {
      const instance1 = ErrorHandler.getInstance();
      const instance2 = ErrorHandler.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should handle string errors', () => {
      const errorInfo = errorHandler.handleError('Test error');
      
      expect(errorInfo.message).toBe('Test error');
      expect(errorInfo.code).toBe('GENERIC_ERROR');
      expect(errorInfo.timestamp).toBeDefined();
      expect(errorInfo.stack).toBeUndefined();
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const errorInfo = errorHandler.handleError(error);
      
      expect(errorInfo.message).toBe('Test error');
      expect(errorInfo.code).toBe('ERROR');
      expect(errorInfo.stack).toBeDefined();
    });

    it('should handle errors with context', () => {
      const context = { userId: '123', action: 'test' };
      const errorInfo = errorHandler.handleError('Test error', context);
      
      expect(errorInfo.context).toEqual(context);
      expect(errorInfo.userId).toBe('123');
    });

    it('should extract error code from error name', () => {
      const error = new ValidationError('Invalid field');
      const errorInfo = errorHandler.handleError(error);
      
      expect(errorInfo.code).toBe('VALIDATIONERROR');
    });

    it('should limit error history', () => {
      const handler = new (ErrorHandler as any)();
      handler.maxErrors = 2;
      
      handler.handleError('Error 1');
      handler.handleError('Error 2');
      handler.handleError('Error 3');
      
      const errors = handler.getErrors();
      expect(errors).toHaveLength(2);
      expect(errors[0].message).toBe('Error 2');
      expect(errors[1].message).toBe('Error 3');
    });

    it('should filter errors by code', () => {
      errorHandler.handleError('Error 1');
      const validationError = new ValidationError('Invalid field');
      errorHandler.handleError(validationError);
      
      const validationErrors = errorHandler.getErrorsByCode('VALIDATIONERROR');
      expect(validationErrors).toHaveLength(1);
      expect(validationErrors[0].message).toBe('Invalid field');
    });

    it('should filter errors by time range', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      errorHandler.handleError('Error 1');
      
      const errorsInRange = errorHandler.getErrorsByTimeRange(oneHourAgo, oneHourFromNow);
      expect(errorsInRange).toHaveLength(1);
      
      const errorsOutOfRange = errorHandler.getErrorsByTimeRange(oneHourFromNow, new Date(now.getTime() + 2 * 60 * 60 * 1000));
      expect(errorsOutOfRange).toHaveLength(0);
    });

    it('should provide error statistics', () => {
      errorHandler.handleError('Error 1');
      errorHandler.handleError(new ValidationError('Invalid field'));
      errorHandler.handleError(new ValidationError('Another invalid field'));
      
      const stats = errorHandler.getErrorStats();
      expect(stats.total).toBe(3);
      expect(stats.byCode).toEqual({
        'GENERIC_ERROR': 1,
        'VALIDATIONERROR': 2
      });
      expect(stats.mostRecent).toBeDefined();
    });

    it('should identify critical errors', () => {
      const dbError = new DatabaseError('Connection failed');
      const validationError = new ValidationError('Invalid field');
      
      expect(errorHandler.isCriticalError(errorHandler.handleError(dbError))).toBe(true);
      expect(errorHandler.isCriticalError(errorHandler.handleError(validationError))).toBe(false);
    });

    it('should get critical errors only', () => {
      errorHandler.handleError(new ValidationError('Invalid field'));
      errorHandler.handleError(new DatabaseError('Connection failed'));
      errorHandler.handleError('Generic error');
      
      const criticalErrors = errorHandler.getCriticalErrors();
      expect(criticalErrors).toHaveLength(1);
      expect(criticalErrors[0].code).toBe('DATABASEERROR');
    });

    it('should create custom errors', () => {
      const error = errorHandler.createError('Custom error', 'CUSTOM_CODE');
      
      expect(error.message).toBe('Custom error');
      expect((error as any).code).toBe('CUSTOM_CODE');
    });

    it('should clear all errors', () => {
      errorHandler.handleError('Error 1');
      errorHandler.handleError('Error 2');
      
      expect(errorHandler.getErrors()).toHaveLength(2);
      
      errorHandler.clearErrors();
      expect(errorHandler.getErrors()).toHaveLength(0);
    });
  });

  describe('Custom Error Classes', () => {
    it('should create ValidationError', () => {
      const error = new ValidationError('Invalid field', 'email');
      
      expect(error.message).toBe('Invalid field');
      expect(error.name).toBe('ValidationError');
      expect(error.field).toBe('email');
    });

    it('should create AuthenticationError', () => {
      const error = new AuthenticationError('Invalid credentials');
      
      expect(error.message).toBe('Invalid credentials');
      expect(error.name).toBe('AuthenticationError');
    });

    it('should create AuthorizationError', () => {
      const error = new AuthorizationError('Access denied');
      
      expect(error.message).toBe('Access denied');
      expect(error.name).toBe('AuthorizationError');
    });

    it('should create NotFoundError', () => {
      const error = new NotFoundError('User not found');
      
      expect(error.message).toBe('User not found');
      expect(error.name).toBe('NotFoundError');
    });

    it('should create DatabaseError', () => {
      const error = new DatabaseError('Query failed');
      
      expect(error.message).toBe('Query failed');
      expect(error.name).toBe('DatabaseError');
    });

    it('should use default messages', () => {
      const authError = new AuthenticationError();
      const authzError = new AuthorizationError();
      const notFoundError = new NotFoundError();
      const dbError = new DatabaseError();
      
      expect(authError.message).toBe('Authentication failed');
      expect(authzError.message).toBe('Access denied');
      expect(notFoundError.message).toBe('Resource not found');
      expect(dbError.message).toBe('Database operation failed');
    });
  });

  describe('Error Handling Utilities', () => {
    it('should handle async errors with withErrorHandling', async () => {
      const failingFn = async () => {
        throw new Error('Async error');
      };
      
      await expect(withErrorHandling(failingFn, { context: 'test' })).rejects.toThrow('Async error');
      
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Async error');
      expect(errors[0].context).toEqual({ context: 'test' });
    });

    it('should handle successful async functions', async () => {
      const successFn = async () => 'success';
      
      const result = await withErrorHandling(successFn);
      expect(result).toBe('success');
      expect(errorHandler.getErrors()).toHaveLength(0);
    });

    it('should handle sync errors with withSyncErrorHandling', () => {
      const failingFn = () => {
        throw new Error('Sync error');
      };
      
      expect(() => withSyncErrorHandling(failingFn, { context: 'test' })).toThrow('Sync error');
      
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Sync error');
      expect(errors[0].context).toEqual({ context: 'test' });
    });

    it('should handle successful sync functions', () => {
      const successFn = () => 'success';
      
      const result = withSyncErrorHandling(successFn);
      expect(result).toBe('success');
      expect(errorHandler.getErrors()).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null context', () => {
      const errorInfo = errorHandler.handleError('Test error', null as any);
      
      expect(errorInfo.context).toBeUndefined();
      expect(errorInfo.userId).toBeUndefined();
    });

    it('should handle undefined context', () => {
      const errorInfo = errorHandler.handleError('Test error', undefined);
      
      expect(errorInfo.context).toBeUndefined();
      expect(errorInfo.userId).toBeUndefined();
    });

    it('should handle empty string error', () => {
      const errorInfo = errorHandler.handleError('');
      
      expect(errorInfo.message).toBe('');
      expect(errorInfo.code).toBe('GENERIC_ERROR');
    });

    it('should handle error without stack', () => {
      const error = new Error('Test error');
      error.stack = undefined;
      
      const errorInfo = errorHandler.handleError(error);
      
      expect(errorInfo.stack).toBeUndefined();
    });

    it('should handle error without name', () => {
      const error = new Error('Test error');
      error.name = '';
      
      const errorInfo = errorHandler.handleError(error);
      
      expect(errorInfo.code).toBeUndefined();
    });
  });

  describe('Performance', () => {
    it('should handle large number of errors efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        errorHandler.handleError(`Error ${i}`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second
      
      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(100); // Limited by maxErrors
    });

    it('should handle rapid error logging', () => {
      const promises = [];
      
      for (let i = 0; i < 100; i++) {
        promises.push(Promise.resolve(errorHandler.handleError(`Error ${i}`)));
      }
      
      return Promise.all(promises).then(() => {
        const errors = errorHandler.getErrors();
        expect(errors).toHaveLength(100);
      });
    });
  });

  describe('Integration', () => {
    it('should work with real error scenarios', () => {
      // Simulate a real error scenario
      try {
        // Simulate validation error
        throw new ValidationError('Email is required', 'email');
      } catch (error) {
        const errorInfo = errorHandler.handleError(error as Error, {
          action: 'user_registration',
          userId: 'user123'
        });
        
        expect(errorInfo.code).toBe('VALIDATIONERROR');
        expect(errorInfo.context).toEqual({
          action: 'user_registration',
          userId: 'user123'
        });
      }
    });

    it('should maintain error order', () => {
      errorHandler.handleError('First error');
      errorHandler.handleError('Second error');
      errorHandler.handleError('Third error');
      
      const errors = errorHandler.getErrors();
      expect(errors[0].message).toBe('First error');
      expect(errors[1].message).toBe('Second error');
      expect(errors[2].message).toBe('Third error');
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory when errors are cleared', () => {
      // Add many errors
      for (let i = 0; i < 500; i++) {
        errorHandler.handleError(`Error ${i}`);
      }
      
      expect(errorHandler.getErrors().length).toBeGreaterThan(0);
      
      // Clear errors
      errorHandler.clearErrors();
      
      expect(errorHandler.getErrors()).toHaveLength(0);
      expect(errorHandler.getErrorStats().total).toBe(0);
    });
  });
});
