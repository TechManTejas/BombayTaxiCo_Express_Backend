/**
 * F2P tests for response formatter utility.
 * These tests would fail on the base branch and pass after the fixes.
 */

import { 
  ResponseFormatter,
  responseFormatter,
  ApiResponse,
  PaginationOptions,
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createNotFoundResponse,
  createValidationErrorResponse,
  formatResponse,
  isSuccessResponse,
  isErrorResponse,
  hasPagination,
  extractData,
  extractError,
  extractErrors,
  extractPagination,
  validateApiResponse,
  sanitizeResponse,
  addResponseMetadata
} from '../utils/response-formatter';

describe('Response Formatter F2P Tests', () => {
  let formatter: ResponseFormatter;

  beforeEach(() => {
    formatter = ResponseFormatter.getInstance();
  });

  describe('ResponseFormatter class', () => {
    it('should be a singleton', () => {
      const instance1 = ResponseFormatter.getInstance();
      const instance2 = ResponseFormatter.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should create success response', () => {
      const data = { id: 1, name: 'Test' };
      const response = formatter.success(data, 'Success message');
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Success message');
      expect(response.error).toBeUndefined();
      expect(response.meta?.timestamp).toBeDefined();
    });

    it('should create error response', () => {
      const response = formatter.error('Error message');
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Error message');
      expect(response.data).toBeUndefined();
      expect(response.message).toBeUndefined();
      expect(response.meta?.timestamp).toBeDefined();
    });

    it('should create paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination: PaginationOptions = { page: 1, limit: 10, total: 50 };
      const response = formatter.paginated(data, pagination, 'Paginated results');
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Paginated results');
      expect(response.meta?.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5
      });
    });

    it('should create created response', () => {
      const data = { id: 1, name: 'New Item' };
      const response = formatter.created(data, 'Item created');
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Item created');
    });

    it('should create updated response', () => {
      const data = { id: 1, name: 'Updated Item' };
      const response = formatter.updated(data, 'Item updated');
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Item updated');
    });

    it('should create deleted response', () => {
      const response = formatter.deleted('Item deleted');
      
      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
      expect(response.message).toBe('Item deleted');
    });

    it('should create not found response', () => {
      const response = formatter.notFound('User');
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('User not found');
    });

    it('should create bad request response', () => {
      const errors = { name: ['Required'], email: ['Invalid format'] };
      const response = formatter.badRequest('Validation failed', errors);
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Validation failed');
      expect(response.errors).toEqual(errors);
    });

    it('should create unauthorized response', () => {
      const response = formatter.unauthorized('Access denied');
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Access denied');
    });

    it('should create forbidden response', () => {
      const response = formatter.forbidden('Permission denied');
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Permission denied');
    });

    it('should create internal error response', () => {
      const response = formatter.internalError('Database error');
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Database error');
    });

    it('should create validation errors response', () => {
      const errors = { field1: ['Error 1'], field2: ['Error 2'] };
      const response = formatter.validationErrors(errors);
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Validation failed');
      expect(response.errors).toEqual(errors);
    });
  });

  describe('Default options', () => {
    it('should include timestamp by default', () => {
      const response = formatter.success({});
      expect(response.meta?.timestamp).toBeDefined();
    });

    it('should not include request ID by default', () => {
      const response = formatter.success({});
      expect(response.meta?.requestId).toBeUndefined();
    });

    it('should include request ID when enabled', () => {
      formatter.setDefaultOptions({ includeRequestId: true });
      const response = formatter.success({});
      expect(response.meta?.requestId).toBeDefined();
      expect(typeof response.meta?.requestId).toBe('string');
    });

    it('should use custom request ID generator', () => {
      const customGenerator = () => 'custom-request-id';
      formatter.setDefaultOptions({ 
        includeRequestId: true, 
        requestIdGenerator: customGenerator 
      });
      const response = formatter.success({});
      expect(response.meta?.requestId).toBe('custom-request-id');
    });

    it('should disable timestamp when configured', () => {
      formatter.setDefaultOptions({ includeTimestamp: false });
      const response = formatter.success({});
      expect(response.meta?.timestamp).toBeUndefined();
    });
  });

  describe('Utility functions', () => {
    it('should create success response using utility', () => {
      const data = { test: 'data' };
      const response = createSuccessResponse(data, 'Success');
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Success');
    });

    it('should create error response using utility', () => {
      const errors = { field: ['error'] };
      const response = createErrorResponse('Error', errors);
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Error');
      expect(response.errors).toEqual(errors);
    });

    it('should create paginated response using utility', () => {
      const data = [1, 2, 3];
      const pagination = { page: 1, limit: 10, total: 3 };
      const response = createPaginatedResponse(data, pagination);
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.meta?.pagination).toBeDefined();
    });

    it('should create not found response using utility', () => {
      const response = createNotFoundResponse('Product');
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Product not found');
    });

    it('should create validation error response using utility', () => {
      const errors = { name: ['Required'] };
      const response = createValidationErrorResponse(errors);
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Validation failed');
      expect(response.errors).toEqual(errors);
    });
  });

  describe('Type guards', () => {
    it('should identify success response', () => {
      const successResponse = formatter.success({});
      const errorResponse = formatter.error('Error');
      
      expect(isSuccessResponse(successResponse)).toBe(true);
      expect(isSuccessResponse(errorResponse)).toBe(false);
    });

    it('should identify error response', () => {
      const successResponse = formatter.success({});
      const errorResponse = formatter.error('Error');
      
      expect(isErrorResponse(successResponse)).toBe(false);
      expect(isErrorResponse(errorResponse)).toBe(true);
    });

    it('should identify paginated response', () => {
      const data = [1, 2, 3];
      const pagination = { page: 1, limit: 10, total: 3 };
      const paginatedResponse = formatter.paginated(data, pagination);
      const normalResponse = formatter.success(data);
      
      expect(hasPagination(paginatedResponse)).toBe(true);
      expect(hasPagination(normalResponse)).toBe(false);
    });
  });

  describe('Data extraction utilities', () => {
    it('should extract data from success response', () => {
      const data = { id: 1 };
      const response = formatter.success(data);
      
      expect(extractData(response)).toEqual(data);
    });

    it('should return null for error response data extraction', () => {
      const response = formatter.error('Error');
      
      expect(extractData(response)).toBeNull();
    });

    it('should extract error from error response', () => {
      const response = formatter.error('Test error');
      
      expect(extractError(response)).toBe('Test error');
    });

    it('should return null for success response error extraction', () => {
      const response = formatter.success({});
      
      expect(extractError(response)).toBeNull();
    });

    it('should extract errors from validation response', () => {
      const errors = { field: ['error'] };
      const response = formatter.validationErrors(errors);
      
      expect(extractErrors(response)).toEqual(errors);
    });

    it('should return null for response without errors', () => {
      const response = formatter.success({});
      
      expect(extractErrors(response)).toBeNull();
    });

    it('should extract pagination from paginated response', () => {
      const data = [1, 2, 3];
      const pagination = { page: 1, limit: 10, total: 3 };
      const response = formatter.paginated(data, pagination);
      
      expect(extractPagination(response)).toEqual({
        page: 1,
        limit: 10,
        total: 3,
        totalPages: 1
      });
    });

    it('should return null for non-paginated response', () => {
      const response = formatter.success({});
      
      expect(extractPagination(response)).toBeNull();
    });
  });

  describe('Response validation', () => {
    it('should validate valid success response', () => {
      const response = formatter.success({ data: 'test' }, 'Success');
      
      expect(validateApiResponse(response)).toBe(true);
    });

    it('should validate valid error response', () => {
      const response = formatter.error('Error message');
      
      expect(validateApiResponse(response)).toBe(true);
    });

    it('should reject invalid response structure', () => {
      const invalidResponse = { invalid: 'structure' };
      
      expect(validateApiResponse(invalidResponse)).toBe(false);
    });

    it('should reject response without success field', () => {
      const response = { data: 'test' };
      
      expect(validateApiResponse(response)).toBe(false);
    });

    it('should reject response with invalid success type', () => {
      const response = { success: 'true' };
      
      expect(validateApiResponse(response)).toBe(false);
    });

    it('should reject response with both data and error', () => {
      const response = { success: true, data: 'test', error: 'error' };
      
      expect(validateApiResponse(response)).toBe(false);
    });

    it('should reject response with invalid message type', () => {
      const response = { success: true, message: 123 };
      
      expect(validateApiResponse(response)).toBe(false);
    });

    it('should reject response with invalid error type', () => {
      const response = { success: false, error: 123 };
      
      expect(validateApiResponse(response)).toBe(false);
    });
  });

  describe('Response transformation', () => {
    it('should sanitize response', () => {
      const response = formatter.success({ data: 'test' });
      const sanitized = sanitizeResponse(response);
      
      expect(sanitized).toEqual(response);
    });

    it('should add metadata to response', () => {
      const response = formatter.success({ data: 'test' });
      const metadata = { version: '1.0', endpoint: '/api/test' };
      const enhanced = addResponseMetadata(response, metadata);
      
      expect(enhanced.meta).toEqual({
        ...response.meta,
        ...metadata
      });
    });

    it('should preserve existing metadata when adding new', () => {
      const response = formatter.success({ data: 'test' });
      const additionalMetadata = { version: '1.0' } as any;
      const enhanced = addResponseMetadata(response, additionalMetadata);
      
      expect(enhanced.meta?.timestamp).toBeDefined();
      expect((enhanced.meta as any).version).toBe('1.0');
    });
  });

  describe('Express middleware', () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;

    beforeEach(() => {
      mockReq = { id: 'test-request-id' };
      mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      mockNext = jest.fn();
    });

    it('should add response methods to res object', () => {
      const middleware = formatResponse();
      middleware(mockReq, mockRes, mockNext);
      
      expect(typeof mockRes.success).toBe('function');
      expect(typeof mockRes.error).toBe('function');
      expect(typeof mockRes.paginated).toBe('function');
      expect(typeof mockRes.created).toBe('function');
      expect(typeof mockRes.notFound).toBe('function');
      expect(typeof mockRes.badRequest).toBe('function');
      expect(typeof mockRes.unauthorized).toBe('function');
      expect(typeof mockRes.forbidden).toBe('function');
      expect(typeof mockRes.internalError).toBe('function');
    });

    it('should call next after adding methods', () => {
      const middleware = formatResponse();
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should format success response through middleware', () => {
      const middleware = formatResponse(formatter);
      middleware(mockReq, mockRes, mockNext);
      
      const data = { test: 'data' };
      mockRes.success(data, 'Success');
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
        message: 'Success',
        meta: {
          timestamp: expect.any(String),
          requestId: 'test-request-id'
        }
      });
    });

    it('should format error response through middleware', () => {
      const middleware = formatResponse(formatter);
      middleware(mockReq, mockRes, mockNext);
      
      mockRes.error('Test error');
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Test error',
        meta: {
          timestamp: expect.any(String),
          requestId: 'test-request-id'
        }
      });
    });

    it('should format paginated response through middleware', () => {
      const middleware = formatResponse(formatter);
      middleware(mockReq, mockRes, mockNext);
      
      const data = [1, 2, 3];
      const pagination = { page: 1, limit: 10, total: 3 };
      mockRes.paginated(data, pagination);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
        meta: {
          timestamp: expect.any(String),
          requestId: 'test-request-id',
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1
          }
        }
      });
    });

    it('should format created response with correct status', () => {
      const middleware = formatResponse(formatter);
      middleware(mockReq, mockRes, mockNext);
      
      const data = { id: 1 };
      mockRes.created(data);
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
        message: 'Resource created successfully',
        meta: {
          timestamp: expect.any(String),
          requestId: 'test-request-id'
        }
      });
    });

    it('should format not found response with correct status', () => {
      const middleware = formatResponse(formatter);
      middleware(mockReq, mockRes, mockNext);
      
      mockRes.notFound('User');
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found',
        meta: {
          timestamp: expect.any(String),
          requestId: 'test-request-id'
        }
      });
    });

    it('should format bad request response with correct status', () => {
      const middleware = formatResponse(formatter);
      middleware(mockReq, mockRes, mockNext);
      
      const errors = { field: ['error'] };
      mockRes.badRequest('Invalid data', errors);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid data',
        errors,
        meta: {
          timestamp: expect.any(String),
          requestId: 'test-request-id'
        }
      });
    });

    it('should format unauthorized response with correct status', () => {
      const middleware = formatResponse(formatter);
      middleware(mockReq, mockRes, mockNext);
      
      mockRes.unauthorized('Access denied');
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied',
        meta: {
          timestamp: expect.any(String),
          requestId: 'test-request-id'
        }
      });
    });

    it('should format forbidden response with correct status', () => {
      const middleware = formatResponse(formatter);
      middleware(mockReq, mockRes, mockNext);
      
      mockRes.forbidden('Permission denied');
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Permission denied',
        meta: {
          timestamp: expect.any(String),
          requestId: 'test-request-id'
        }
      });
    });

    it('should format internal error response with correct status', () => {
      const middleware = formatResponse(formatter);
      middleware(mockReq, mockRes, mockNext);
      
      mockRes.internalError('Server error');
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server error',
        meta: {
          timestamp: expect.any(String),
          requestId: 'test-request-id'
        }
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle null data in success response', () => {
      const response = formatter.success(null);
      
      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });

    it('should handle undefined data in success response', () => {
      const response = formatter.success(undefined);
      
      expect(response.success).toBe(true);
      expect(response.data).toBeUndefined();
    });

    it('should handle empty message', () => {
      const response = formatter.success({}, '');
      
      expect(response.success).toBe(true);
      expect(response.message).toBe('');
    });

    it('should handle empty errors object', () => {
      const response = formatter.error('Error', undefined, {} as Record<string, string[]>);
      
      expect(response.success).toBe(false);
      expect(response.errors).toEqual({});
    });

    it('should calculate total pages correctly', () => {
      const data = [1, 2, 3];
      const pagination = { page: 1, limit: 2, total: 5 };
      const response = formatter.paginated(data, pagination);
      
      expect(response.meta?.pagination?.totalPages).toBe(3);
    });

    it('should handle zero total in pagination', () => {
      const data: any[] = [];
      const pagination = { page: 1, limit: 10, total: 0 };
      const response = formatter.paginated(data, pagination);
      
      expect(response.meta?.pagination?.totalPages).toBe(0);
    });

    it('should handle request without ID in middleware', () => {
      const middleware = formatResponse(formatter);
      const reqWithoutId = {};
      const localMockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      const localMockNext = jest.fn();
      
      middleware(reqWithoutId, localMockRes, localMockNext);
      
      localMockRes.success({ test: 'data' });
      
      const callArgs = localMockRes.json.mock.calls[0][0];
      expect(callArgs.meta.requestId).toBeDefined();
      expect(typeof callArgs.meta.requestId).toBe('string');
    });
  });

  describe('Performance', () => {
    it('should handle large data sets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      const startTime = Date.now();
      
      const response = formatter.success(largeData);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.data).toHaveLength(1000);
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle many response creations efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        formatter.success({ id: i }, `Message ${i}`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Integration scenarios', () => {
    it('should work with complex data structures', () => {
      const complexData = {
        user: {
          id: 1,
          profile: {
            name: 'John',
            preferences: {
              theme: 'dark',
              notifications: true
            }
          }
        },
        items: [
          { id: 1, tags: ['tag1', 'tag2'] },
          { id: 2, tags: ['tag3'] }
        ]
      };
      
      const response = formatter.success(complexData, 'Complex data loaded');
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual(complexData);
      expect(response.message).toBe('Complex data loaded');
    });

    it('should handle real-world pagination scenario', () => {
      const users = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));
      const pagination = { page: 2, limit: 10, total: 45 };
      
      const response = formatter.paginated(users, pagination, 'Users retrieved');
      
      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(20);
      expect(response.meta?.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 45,
        totalPages: 5
      });
    });

    it('should handle validation errors with multiple fields', () => {
      const errors = {
        name: ['Required', 'Too short'],
        email: ['Invalid format', 'Already exists'],
        password: ['Too weak', 'Missing special character'],
        age: ['Must be a number', 'Must be over 18']
      };
      
      const response = formatter.validationErrors(errors);
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Validation failed');
      expect(response.errors).toEqual(errors);
    });
  });
});
