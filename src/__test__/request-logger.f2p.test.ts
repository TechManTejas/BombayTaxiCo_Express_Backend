/**
 * F2P tests for request logger utility.
 * These tests would fail on the base branch and pass after the fixes.
 */

import { Request, Response, NextFunction } from 'express';
import { RequestLogger, requestLogger } from '../utils/request-logger';

describe('Request Logger F2P Tests', () => {
  let logger: RequestLogger;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    logger = new RequestLogger(10);
    mockReq = {
      method: 'GET',
      url: '/test',
      get: jest.fn()
    };
    mockRes = {
      statusCode: 200,
      on: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('RequestLogger class', () => {
    it('should create logger with default max logs', () => {
      const defaultLogger = new RequestLogger();
      expect(defaultLogger.getLogs()).toHaveLength(0);
    });

    it('should create logger with custom max logs', () => {
      const customLogger = new RequestLogger(5);
      expect(customLogger.getLogs()).toHaveLength(0);
    });

    it('should return middleware function', () => {
      const middleware = logger.middleware();
      expect(typeof middleware).toBe('function');
    });

    it('should log requests when response finishes', () => {
      const middleware = logger.middleware();
      
      // Mock response finish event
      let finishCallback: Function;
      mockRes.on = jest.fn((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
      
      // Simulate response finish
      if (finishCallback) {
        finishCallback();
      }
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        method: 'GET',
        url: '/test',
        statusCode: 200
      });
    });

    it('should limit logs to max size', () => {
      const middleware = logger.middleware();
      let finishCallback: Function;
      
      mockRes.on = jest.fn((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      // Add more logs than max size
      for (let i = 0; i < 15; i++) {
        middleware(mockReq as Request, mockRes as Response, mockNext);
        if (finishCallback) {
          finishCallback();
        }
      }
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(10); // Should be limited to maxLogs
    });

    it('should clear all logs', () => {
      const middleware = logger.middleware();
      let finishCallback: Function;
      
      mockRes.on = jest.fn((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware(mockReq as Request, mockRes as Response, mockNext);
      if (finishCallback) {
        finishCallback();
      }
      
      expect(logger.getLogs()).toHaveLength(1);
      
      logger.clearLogs();
      expect(logger.getLogs()).toHaveLength(0);
    });

    it('should filter logs by status code', () => {
      const middleware = logger.middleware();
      let finishCallback: Function;
      
      mockRes.on = jest.fn((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      // Add logs with different status codes
      mockRes.statusCode = 200;
      middleware(mockReq as Request, mockRes as Response, mockNext);
      if (finishCallback) {
        finishCallback();
      }
      
      mockRes.statusCode = 404;
      middleware(mockReq as Request, mockRes as Response, mockNext);
      if (finishCallback) {
        finishCallback();
      }
      
      const successLogs = logger.getLogsByStatus(200);
      const errorLogs = logger.getLogsByStatus(404);
      
      expect(successLogs).toHaveLength(1);
      expect(errorLogs).toHaveLength(1);
      expect(successLogs[0].statusCode).toBe(200);
      expect(errorLogs[0].statusCode).toBe(404);
    });

    it('should filter logs by method', () => {
      const middleware = logger.middleware();
      let finishCallback: Function;
      
      mockRes.on = jest.fn((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      // Add logs with different methods
      mockReq.method = 'GET';
      middleware(mockReq as Request, mockRes as Response, mockNext);
      if (finishCallback) {
        finishCallback();
      }
      
      mockReq.method = 'POST';
      middleware(mockReq as Request, mockRes as Response, mockNext);
      if (finishCallback) {
        finishCallback();
      }
      
      const getLogs = logger.getLogsByMethod('GET');
      const postLogs = logger.getLogsByMethod('POST');
      
      expect(getLogs).toHaveLength(1);
      expect(postLogs).toHaveLength(1);
      expect(getLogs[0].method).toBe('GET');
      expect(postLogs[0].method).toBe('POST');
    });

    it('should calculate statistics correctly', () => {
      const middleware = logger.middleware();
      let finishCallback: Function;
      
      mockRes.on = jest.fn((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      // Add some logs
      mockRes.statusCode = 200;
      middleware(mockReq as Request, mockRes as Response, mockNext);
      if (finishCallback) {
        finishCallback();
      }
      
      mockRes.statusCode = 404;
      middleware(mockReq as Request, mockRes as Response, mockNext);
      if (finishCallback) {
        finishCallback();
      }
      
      const stats = logger.getStats();
      
      expect(stats.total).toBe(2);
      expect(stats.success).toBe(1);
      expect(stats.errors).toBe(1);
      expect(stats.avgResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should include user agent and IP when available', () => {
      const middleware = logger.middleware();
      let finishCallback: Function;
      
      mockReq.get = jest.fn().mockReturnValue('Test-Agent');
      mockReq.ip = '127.0.0.1';
      
      mockRes.on = jest.fn((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware(mockReq as Request, mockRes as Response, mockNext);
      if (finishCallback) {
        finishCallback();
      }
      
      const logs = logger.getLogs();
      expect(logs[0].userAgent).toBe('Test-Agent');
      expect(logs[0].ip).toBe('127.0.0.1');
    });

    it('should handle missing user agent and IP', () => {
      const middleware = logger.middleware();
      let finishCallback: Function;
      
      mockRes.on = jest.fn((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware(mockReq as Request, mockRes as Response, mockNext);
      if (finishCallback) {
        finishCallback();
      }
      
      const logs = logger.getLogs();
      expect(logs[0].userAgent).toBeUndefined();
      expect(logs[0].ip).toBeUndefined();
    });
  });

  describe('requestLogger instance', () => {
    it('should export a default logger instance', () => {
      expect(requestLogger).toBeInstanceOf(RequestLogger);
    });

    it('should have default configuration', () => {
      const stats = requestLogger.getStats();
      expect(stats.total).toBe(0);
      expect(stats.success).toBe(0);
      expect(stats.errors).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully', () => {
      const middleware = logger.middleware();
      
      // Mock response that throws error
      mockRes.on = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      expect(() => {
        middleware(mockReq as Request, mockRes as Response, mockNext);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle high volume of requests', () => {
      const middleware = logger.middleware();
      let finishCallback: Function;
      
      mockRes.on = jest.fn((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      const startTime = Date.now();
      
      // Add 100 logs
      for (let i = 0; i < 100; i++) {
        middleware(mockReq as Request, mockRes as Response, mockNext);
        if (finishCallback) {
          finishCallback();
        }
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second
      expect(logger.getLogs().length).toBeLessThanOrEqual(10); // Limited by maxLogs
    });
  });
});
