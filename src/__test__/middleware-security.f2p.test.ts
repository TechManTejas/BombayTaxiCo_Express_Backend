/**
 * F2P tests for middleware security enhancements.
 * These tests would fail on the base branch and pass after the fixes.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { authenticateToken, validateJwtConfig, securityHeaders } from '../middleware/auth.middleware';

describe('Middleware Security F2P Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    
    // Mock console methods
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('authenticateToken enhancements', () => {
    it('should reject requests without Authorization header', () => {
      // Bug: Should handle missing Authorization header
      mockRequest.header = jest.fn().mockReturnValue(undefined);
      
      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized - Token not provided' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid token format', () => {
      // Bug: Should validate Bearer prefix
      mockRequest.header = jest.fn().mockReturnValue('InvalidToken');
      
      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized - Invalid token format' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject tokens with invalid structure', () => {
      // Bug: Should validate JWT structure
      mockRequest.header = jest.fn().mockReturnValue('Bearer invalid-jwt-structure');
      
      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized - Invalid token structure' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject tokens without userId in payload', () => {
      // Bug: Should validate token payload structure
      const tokenWithoutUserId = jwt.sign({ data: 'test' }, 'test-secret');
      mockRequest.header = jest.fn().mockReturnValue(`Bearer ${tokenWithoutUserId}`);
      
      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized - Invalid token' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject tokens with invalid userId type', () => {
      // Bug: Should validate userId type
      const tokenWithInvalidUserId = jwt.sign({ userId: {} }, 'test-secret');
      mockRequest.header = jest.fn().mockReturnValue(`Bearer ${tokenWithInvalidUserId}`);
      
      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized - Invalid token' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should accept valid tokens and attach user info', () => {
      // Bug: Should properly handle valid tokens
      const originalEnv = process.env.JWT_SECRET_KEY;
      process.env.JWT_SECRET_KEY = 'test-secret';
      
      const validToken = jwt.sign({ userId: 'user123' }, 'test-secret');
      mockRequest.header = jest.fn().mockReturnValue(`Bearer ${validToken}`);
      
      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect((mockRequest as any).userId).toBe('user123');
      expect((mockRequest as any).tokenPayload).toBeDefined();
      expect(nextFunction).toHaveBeenCalled();
      
      // Restore
      process.env.JWT_SECRET_KEY = originalEnv;
    });

    it('should handle expired tokens gracefully', () => {
      // Bug: Should handle expired tokens
      const expiredToken = jwt.sign({ userId: 'user123' }, 'test-secret', { expiresIn: '-1s' });
      mockRequest.header = jest.fn().mockReturnValue(`Bearer ${expiredToken}`);
      
      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized - Invalid token' });
      expect(console.warn).toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('validateJwtConfig middleware', () => {
    it('should reject when JWT_SECRET_KEY is not set', () => {
      // Bug: Should validate JWT secret configuration
      const originalEnv = process.env.JWT_SECRET_KEY;
      delete process.env.JWT_SECRET_KEY;
      
      validateJwtConfig(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Server configuration error' });
      expect(console.error).toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
      
      // Restore
      process.env.JWT_SECRET_KEY = originalEnv;
    });

    it('should reject when JWT_SECRET_KEY is default value', () => {
      // Bug: Should reject default JWT secret
      const originalEnv = process.env.JWT_SECRET_KEY;
      process.env.JWT_SECRET_KEY = 'your-secret-key';
      
      validateJwtConfig(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Server configuration error' });
      expect(console.error).toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
      
      // Restore
      process.env.JWT_SECRET_KEY = originalEnv;
    });

    it('should reject when JWT_SECRET_KEY is too short', () => {
      // Bug: Should require minimum JWT secret length
      const originalEnv = process.env.JWT_SECRET_KEY;
      process.env.JWT_SECRET_KEY = 'short';
      
      validateJwtConfig(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Server configuration error' });
      expect(console.error).toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
      
      // Restore
      process.env.JWT_SECRET_KEY = originalEnv;
    });

    it('should accept properly configured JWT_SECRET_KEY', () => {
      // Bug: Should accept valid JWT configuration
      const originalEnv = process.env.JWT_SECRET_KEY;
      process.env.JWT_SECRET_KEY = 'this-is-a-very-long-and-secure-jwt-secret-key-that-meets-requirements';
      
      validateJwtConfig(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
      
      // Restore
      process.env.JWT_SECRET_KEY = originalEnv;
    });
  });

  describe('securityHeaders middleware', () => {
    it('should set all security headers', () => {
      // Bug: Should set comprehensive security headers
      securityHeaders(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Security-Policy', "default-src 'self'");
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should set HSTS header in production', () => {
      // Bug: Should set HSTS in production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      securityHeaders(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      expect(nextFunction).toHaveBeenCalled();
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should not set HSTS header in development', () => {
      // Bug: Should not set HSTS in development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      securityHeaders(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Strict-Transport-Security', expect.any(String));
      expect(nextFunction).toHaveBeenCalled();
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Token validation edge cases', () => {
    it('should handle tokens with special characters', () => {
      // Bug: Should reject tokens with invalid characters
      const tokenWithSpecialChars = 'Bearer token.with@special#chars';
      mockRequest.header = jest.fn().mockReturnValue(tokenWithSpecialChars);
      
      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized - Invalid token structure' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle tokens with correct structure but invalid payload', () => {
      // Bug: Should validate token payload structure
      const tokenWithInvalidPayload = jwt.sign({ userId: null }, 'test-secret');
      mockRequest.header = jest.fn().mockReturnValue(`Bearer ${tokenWithInvalidPayload}`);
      
      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized - Invalid token' });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
