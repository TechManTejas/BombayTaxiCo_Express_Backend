/**
 * F2P tests for logging enhancements.
 * These tests would fail on the base branch and pass after the fixes.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  Logger,
  LogLevel,
  ChildLogger,
  PerformanceLogger,
  AuditLogger,
  logger,
  performanceLogger,
  auditLogger,
  setRequestContext,
  clearRequestContext
} from '../utils/logger';

// Mock console methods
const originalConsole = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error
};

describe('Logging Enhancements F2P Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods
    console.debug = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    clearRequestContext();
  });

  afterEach(() => {
    // Restore console methods
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    clearRequestContext();
  });

  describe('Logger Basic Functionality', () => {
    it('should create logger with default config', () => {
      // Bug: Should create logger with default configuration
      const testLogger = new Logger();
      const config = testLogger.getConfig();
      
      expect(config.level).toBe(LogLevel.INFO);
      expect(config.enableConsole).toBe(true);
      expect(config.enableFile).toBe(false);
      expect(config.enableStructuredOutput).toBe(true);
      expect(config.enableColors).toBe(true);
    });

    it('should create logger with custom config', () => {
      // Bug: Should create logger with custom configuration
      const testLogger = new Logger({
        level: LogLevel.DEBUG,
        enableConsole: false,
        enableFile: true,
        enableColors: false
      });
      
      const config = testLogger.getConfig();
      expect(config.level).toBe(LogLevel.DEBUG);
      expect(config.enableConsole).toBe(false);
      expect(config.enableFile).toBe(true);
      expect(config.enableColors).toBe(false);
    });

    it('should log debug messages', () => {
      // Bug: Should log debug messages
      const testLogger = new Logger({ level: LogLevel.DEBUG });
      testLogger.debug('Debug message', 'test-context', { key: 'value' });
      
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG')
      );
    });

    it('should log info messages', () => {
      // Bug: Should log info messages
      const testLogger = new Logger();
      testLogger.info('Info message', 'test-context', { key: 'value' });
      
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO')
      );
    });

    it('should log warning messages', () => {
      // Bug: Should log warning messages
      const testLogger = new Logger();
      testLogger.warn('Warning message', 'test-context', { key: 'value' });
      
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN')
      );
    });

    it('should log error messages', () => {
      // Bug: Should log error messages
      const testLogger = new Logger();
      const error = new Error('Test error');
      testLogger.error('Error message', error, 'test-context', { key: 'value' });
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR')
      );
    });

    it('should log fatal messages', () => {
      // Bug: Should log fatal messages
      const testLogger = new Logger();
      const error = new Error('Fatal error');
      testLogger.fatal('Fatal message', error, 'test-context', { key: 'value' });
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('FATAL')
      );
    });
  });

  describe('Logger Level Filtering', () => {
    it('should filter messages below configured level', () => {
      // Bug: Should filter messages below configured level
      const testLogger = new Logger({ level: LogLevel.WARN });
      
      testLogger.debug('Debug message');
      testLogger.info('Info message');
      testLogger.warn('Warning message');
      testLogger.error('Error message');
      
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should pass messages at or above configured level', () => {
      // Bug: Should pass messages at or above configured level
      const testLogger = new Logger({ level: LogLevel.ERROR });
      
      testLogger.debug('Debug message');
      testLogger.info('Info message');
      testLogger.warn('Warning message');
      testLogger.error('Error message');
      testLogger.fatal('Fatal message');
      
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(2); // ERROR and FATAL
    });
  });

  describe('Logger Context Filtering', () => {
    it('should filter by allowed contexts', () => {
      // Bug: Should filter by allowed contexts
      const testLogger = new Logger({
        contexts: ['allowed', 'test']
      });
      
      testLogger.info('Message 1', 'allowed');
      testLogger.info('Message 2', 'test');
      testLogger.info('Message 3', 'blocked');
      testLogger.info('Message 4'); // No context
      
      expect(console.info).toHaveBeenCalledTimes(2);
    });

    it('should allow all contexts when no filter specified', () => {
      // Bug: Should allow all contexts when no filter specified
      const testLogger = new Logger();
      
      testLogger.info('Message 1', 'context1');
      testLogger.info('Message 2', 'context2');
      testLogger.info('Message 3');
      
      expect(console.info).toHaveBeenCalledTimes(3);
    });
  });

  describe('Logger Output Formats', () => {
    it('should output structured format when enabled', () => {
      // Bug: Should output structured format when enabled
      const testLogger = new Logger({
        enableStructuredOutput: true,
        enableColors: false
      });
      
      testLogger.info('Test message', 'test', { key: 'value' });
      
      const output = (console.info as any).mock.calls[0][0];
      const parsed = JSON.parse(output);
      
      expect(parsed.level).toBe(LogLevel.INFO);
      expect(parsed.message).toBe('Test message');
      expect(parsed.context).toBe('test');
      expect(parsed.metadata.key).toBe('value');
    });

    it('should output human-readable format when structured disabled', () => {
      // Bug: Should output human-readable format when structured disabled
      const testLogger = new Logger({
        enableStructuredOutput: false,
        enableColors: false
      });
      
      testLogger.info('Test message', 'test', { key: 'value' });
      
      const output = (console.info as any).mock.calls[0][0];
      
      expect(output).toContain('INFO');
      expect(output).toContain('Test message');
      expect(output).toContain('[test]');
      expect(output).toContain('{"key":"value"}');
    });
  });

  describe('Logger Buffer Management', () => {
    it('should maintain log buffer', () => {
      // Bug: Should maintain log buffer
      const testLogger = new Logger();
      
      testLogger.info('Message 1');
      testLogger.info('Message 2');
      testLogger.info('Message 3');
      
      const recentLogs = testLogger.getRecentLogs();
      expect(recentLogs).toHaveLength(3);
      expect(recentLogs[0].message).toBe('Message 1');
      expect(recentLogs[2].message).toBe('Message 3');
    });

    it('should limit buffer size', () => {
      // Bug: Should limit buffer size
      const testLogger = new Logger();
      
      // Add more logs than buffer size (1000)
      for (let i = 0; i < 1005; i++) {
        testLogger.info(`Message ${i}`);
      }
      
      const recentLogs = testLogger.getRecentLogs();
      expect(recentLogs).toHaveLength(1000);
      expect(recentLogs[0].message).toBe('Message 5'); // First 5 should be dropped
    });

    it('should clear buffer', () => {
      // Bug: Should clear buffer
      const testLogger = new Logger();
      
      testLogger.info('Message 1');
      testLogger.info('Message 2');
      
      expect(testLogger.getRecentLogs()).toHaveLength(2);
      
      testLogger.clearBuffer();
      expect(testLogger.getRecentLogs()).toHaveLength(0);
    });

    it('should get logs by level', () => {
      // Bug: Should get logs by level
      const testLogger = new Logger();
      
      testLogger.info('Info message');
      testLogger.warn('Warning message');
      testLogger.error('Error message');
      testLogger.info('Another info message');
      
      const infoLogs = testLogger.getLogsByLevel(LogLevel.INFO);
      const errorLogs = testLogger.getLogsByLevel(LogLevel.ERROR);
      
      expect(infoLogs).toHaveLength(2);
      expect(errorLogs).toHaveLength(1);
    });

    it('should get logs by context', () => {
      // Bug: Should get logs by context
      const testLogger = new Logger();
      
      testLogger.info('Message 1', 'context1');
      testLogger.info('Message 2', 'context2');
      testLogger.info('Message 3', 'context1');
      
      const context1Logs = testLogger.getLogsByContext('context1');
      const context2Logs = testLogger.getLogsByContext('context2');
      
      expect(context1Logs).toHaveLength(2);
      expect(context2Logs).toHaveLength(1);
    });
  });

  describe('Logger Statistics', () => {
    it('should provide log statistics', () => {
      // Bug: Should provide log statistics
      const testLogger = new Logger();
      
      testLogger.info('Info 1');
      testLogger.info('Info 2');
      testLogger.warn('Warning 1');
      testLogger.error('Error 1');
      testLogger.info('Info 3', 'context1');
      testLogger.warn('Warning 2', 'context1');
      
      const stats = testLogger.getStats();
      
      expect(stats.total).toBe(5);
      expect(stats.byLevel.INFO).toBe(3);
      expect(stats.byLevel.WARN).toBe(2);
      expect(stats.byLevel.ERROR).toBe(1);
      expect(stats.byContext.context1).toBe(2);
    });
  });

  describe('Child Logger', () => {
    it('should create child logger with context', () => {
      // Bug: Should create child logger with context
      const parentLogger = new Logger();
      const childLogger = parentLogger.child('child-context');
      
      expect(childLogger).toBeInstanceOf(ChildLogger);
    });

    it('should log with predefined context', () => {
      // Bug: Should log with predefined context
      const parentLogger = new Logger();
      const childLogger = parentLogger.child('child-context');
      
      childLogger.info('Child message');
      
      const recentLogs = parentLogger.getRecentLogs();
      expect(recentLogs[0].context).toBe('child-context');
      expect(recentLogs[0].message).toBe('Child message');
    });
  });

  describe('Request Context', () => {
    it('should add request context to logs', () => {
      // Bug: Should add request context to logs
      const testLogger = new Logger();
      
      setRequestContext({
        userId: 'user123',
        requestId: 'req456',
        ip: '192.168.1.1',
        userAgent: 'TestAgent'
      });
      
      testLogger.info('Test message');
      
      const recentLogs = testLogger.getRecentLogs();
      expect(recentLogs[0].userId).toBe('user123');
      expect(recentLogs[0].requestId).toBe('req456');
      expect(recentLogs[0].ip).toBe('192.168.1.1');
      expect(recentLogs[0].userAgent).toBe('TestAgent');
    });

    it('should clear request context', () => {
      // Bug: Should clear request context
      const testLogger = new Logger();
      
      setRequestContext({ userId: 'user123' });
      testLogger.info('Message 1');
      
      clearRequestContext();
      testLogger.info('Message 2');
      
      const logs = testLogger.getRecentLogs();
      expect(logs[0].userId).toBe('user123');
      expect(logs[1].userId).toBeUndefined();
    });
  });

  describe('Performance Logger', () => {
    it('should measure execution time', () => {
      // Bug: Should measure execution time
      const perfLogger = new PerformanceLogger();
      
      perfLogger.start('test-operation');
      
      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Wait 10ms
      }
      
      const duration = perfLogger.end('test-operation');
      
      expect(duration).toBeGreaterThan(5);
      expect(duration).toBeLessThan(100);
    });

    it('should handle missing timer', () => {
      // Bug: Should handle missing timer gracefully
      const perfLogger = new PerformanceLogger();
      
      const duration = perfLogger.end('non-existent-timer');
      expect(duration).toBe(0);
    });

    it('should time synchronous functions', () => {
      // Bug: Should time synchronous functions
      const perfLogger = new PerformanceLogger();
      
      const result = perfLogger.time('sync-operation', () => {
        return 'test-result';
      });
      
      expect(result).toBe('test-result');
    });

    it('should time asynchronous functions', async () => {
      // Bug: Should time asynchronous functions
      const perfLogger = new PerformanceLogger();
      
      const result = await perfLogger.timeAsync('async-operation', async () => {
        return 'async-result';
      });
      
      expect(result).toBe('async-result');
    });
  });

  describe('Audit Logger', () => {
    it('should log audit actions', () => {
      // Bug: Should log audit actions
      auditLogger.logAction('CREATE', 'user123', 'booking', 'booking456', {
        amount: 1000,
        currency: 'USD'
      });
      
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Audit: CREATE on booking:booking456 by user user123')
      );
    });

    it('should log security events', () => {
      // Bug: Should log security events
      auditLogger.logSecurityEvent('LOGIN_FAILED', 'high', {
        userId: 'user123',
        ip: '192.168.1.1',
        attempts: 3
      });
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Security Event: LOGIN_FAILED')
      );
    });

    it('should log low severity security events', () => {
      // Bug: Should log low severity security events
      auditLogger.logSecurityEvent('SUSPICIOUS_ACTIVITY', 'low', {
        userId: 'user123',
        activity: 'multiple_failed_attempts'
      });
      
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Security Event: SUSPICIOUS_ACTIVITY')
      );
    });

    it('should log medium severity security events', () => {
      // Bug: Should log medium severity security events
      auditLogger.logSecurityEvent('BRUTE_FORCE_ATTEMPT', 'medium', {
        ip: '192.168.1.1',
        attempts: 10
      });
      
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Security Event: BRUTE_FORCE_ATTEMPT')
      );
    });
  });

  describe('Logger Configuration Updates', () => {
    it('should update configuration', () => {
      // Bug: Should update configuration
      const testLogger = new Logger();
      
      testLogger.updateConfig({
        level: LogLevel.DEBUG,
        enableColors: false
      });
      
      const config = testLogger.getConfig();
      expect(config.level).toBe(LogLevel.DEBUG);
      expect(config.enableColors).toBe(false);
    });

    it('should preserve existing config when updating', () => {
      // Bug: Should preserve existing config when updating
      const testLogger = new Logger({
        level: LogLevel.WARN,
        enableConsole: false,
        enableFile: true
      });
      
      testLogger.updateConfig({
        level: LogLevel.DEBUG
      });
      
      const config = testLogger.getConfig();
      expect(config.level).toBe(LogLevel.DEBUG);
      expect(config.enableConsole).toBe(false);
      expect(config.enableFile).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should include error details in logs', () => {
      // Bug: Should include error details in logs
      const testLogger = new Logger();
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';
      
      testLogger.error('Error occurred', error);
      
      const recentLogs = testLogger.getRecentLogs();
      expect(recentLogs[0].error?.name).toBe('Error');
      expect(recentLogs[0].error?.message).toBe('Test error');
      expect(recentLogs[0].error?.stack).toBe('Error: Test error\n    at test.js:1:1');
    });

    it('should handle missing error gracefully', () => {
      // Bug: Should handle missing error gracefully
      const testLogger = new Logger();
      
      expect(() => {
        testLogger.error('Error without error object');
      }).not.toThrow();
      
      const recentLogs = testLogger.getRecentLogs();
      expect(recentLogs[0].error).toBeUndefined();
    });
  });

  describe('Color Output', () => {
    it('should add colors when enabled', () => {
      // Bug: Should add colors when enabled
      const testLogger = new Logger({
        enableStructuredOutput: false,
        enableColors: true
      });
      
      testLogger.info('Test message');
      
      const output = (console.info as any).mock.calls[0][0];
      expect(output).toContain('\x1b[32m'); // Green color for INFO
      expect(output).toContain('\x1b[0m');  // Reset color
    });

    it('should not add colors when disabled', () => {
      // Bug: Should not add colors when disabled
      const testLogger = new Logger({
        enableStructuredOutput: false,
        enableColors: false
      });
      
      testLogger.info('Test message');
      
      const output = (console.info as any).mock.calls[0][0];
      expect(output).not.toContain('\x1b[');
    });
  });

  describe('Default Logger Instance', () => {
    it('should provide default logger instance', () => {
      // Bug: Should provide default logger instance
      expect(logger).toBeInstanceOf(Logger);
      expect(logger.getConfig().level).toBe(LogLevel.INFO);
    });

    it('should provide default performance logger', () => {
      // Bug: Should provide default performance logger
      expect(performanceLogger).toBeInstanceOf(PerformanceLogger);
    });

    it('should provide default audit logger', () => {
      // Bug: Should provide default audit logger
      expect(auditLogger).toBeInstanceOf(AuditLogger);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty metadata', () => {
      // Bug: Should handle empty metadata
      const testLogger = new Logger();
      
      expect(() => {
        testLogger.info('Message', 'context', {});
      }).not.toThrow();
    });

    it('should handle undefined metadata', () => {
      // Bug: Should handle undefined metadata
      const testLogger = new Logger();
      
      expect(() => {
        testLogger.info('Message', 'context');
      }).not.toThrow();
    });

    it('should handle circular references in metadata', () => {
      // Bug: Should handle circular references in metadata
      const testLogger = new Logger();
      const circular: any = { name: 'test' };
      circular.self = circular;
      
      expect(() => {
        testLogger.info('Message', 'context', circular);
      }).not.toThrow();
    });

    it('should handle very long messages', () => {
      // Bug: Should handle very long messages
      const testLogger = new Logger();
      const longMessage = 'x'.repeat(10000);
      
      expect(() => {
        testLogger.info(longMessage);
      }).not.toThrow();
    });
  });
});
