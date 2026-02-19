/**
 * Enhanced logging utility for BombayTaxiCo Express Backend.
 * Provides structured logging with different levels and contexts.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  maxFileSize?: number;
  maxFiles?: number;
  enableStructuredOutput: boolean;
  enableColors: boolean;
  contexts?: string[];
}

export class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 1000;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      enableStructuredOutput: true,
      enableColors: true,
      ...config
    };
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, metadata, error);
  }

  /**
   * Log fatal error message
   */
  fatal(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, context, metadata, error);
  }

  /**
   * Core logging method
   */
  protected log(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    error?: Error
  ): void {
    // Skip if level is below configured threshold
    if (level < this.config.level) {
      return;
    }

    // Filter by context if specified
    if (this.config.contexts && context && !this.config.contexts.includes(context)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      metadata,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    };

    // Add request context if available
    this.addRequestContext(logEntry);

    // Add to buffer
    this.addToBuffer(logEntry);

    // Output logs
    if (this.config.enableConsole) {
      this.outputToConsole(logEntry);
    }

    if (this.config.enableFile) {
      this.outputToFile(logEntry);
    }
  }

  /**
   * Add request context to log entry
   */
  private addRequestContext(logEntry: LogEntry): void {
    // This would typically be populated from request middleware
    // For now, we'll add placeholder logic
    if (typeof global !== 'undefined' && (global as any).requestContext) {
      const context = (global as any).requestContext;
      logEntry.userId = context.userId;
      logEntry.requestId = context.requestId;
      logEntry.ip = context.ip;
      logEntry.userAgent = context.userAgent;
    }
  }

  /**
   * Add log entry to buffer
   */
  private addToBuffer(logEntry: LogEntry): void {
    this.logBuffer.push(logEntry);
    
    // Maintain buffer size
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  /**
   * Output to console
   */
  private outputToConsole(logEntry: LogEntry): void {
    const levelName = LogLevel[logEntry.level];
    const timestamp = logEntry.timestamp;
    const context = logEntry.context ? `[${logEntry.context}]` : '';
    const message = logEntry.message;

    let output: string;

    if (this.config.enableStructuredOutput) {
      output = JSON.stringify(logEntry);
    } else {
      output = `${timestamp} ${levelName} ${context} ${message}`;
      
      if (logEntry.metadata) {
        output += ` ${JSON.stringify(logEntry.metadata)}`;
      }
      
      if (logEntry.error) {
        output += ` ${logEntry.error.name}: ${logEntry.error.message}`;
        if (logEntry.error.stack) {
          output += `\n${logEntry.error.stack}`;
        }
      }
    }

    if (this.config.enableColors) {
      output = this.colorizeOutput(output, logEntry.level);
    }

    // Output to appropriate console method
    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.debug(output);
        break;
      case LogLevel.INFO:
        console.info(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(output);
        break;
    }
  }

  /**
   * Output to file
   */
  private outputToFile(logEntry: LogEntry): void {
    // File logging implementation would go here
    // For now, we'll just add to buffer
    // In a real implementation, this would write to a file system
  }

  /**
   * Colorize console output
   */
  private colorizeOutput(output: string, level: LogLevel): string {
    if (!this.config.enableColors) {
      return output;
    }

    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.FATAL]: '\x1b[35m'  // Magenta
    };

    const reset = '\x1b[0m';
    return `${colors[level]}${output}${reset}`;
  }

  /**
   * Get recent logs from buffer
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logBuffer.filter(entry => entry.level === level);
  }

  /**
   * Get logs by context
   */
  getLogsByContext(context: string): LogEntry[] {
    return this.logBuffer.filter(entry => entry.context === context);
  }

  /**
   * Update logger configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Create child logger with context
   */
  child(context: string): ChildLogger {
    return new ChildLogger(this, context);
  }

  /**
   * Get log statistics
   */
  getStats(): {
    total: number;
    byLevel: Record<string, number>;
    byContext: Record<string, number>;
  } {
    const stats = {
      total: this.logBuffer.length,
      byLevel: {} as Record<string, number>,
      byContext: {} as Record<string, number>
    };

    for (const entry of this.logBuffer) {
      const levelName = LogLevel[entry.level];
      stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1;
      
      if (entry.context) {
        stats.byContext[entry.context] = (stats.byContext[entry.context] || 0) + 1;
      }
    }

    return stats;
  }
}

/**
 * Child logger with predefined context
 */
export class ChildLogger {
  constructor(
    private parent: Logger,
    private context: string
  ) {}

  debug(message: string, metadata?: Record<string, any>): void {
    this.parent.debug(message, this.context, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.parent.info(message, this.context, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.parent.warn(message, this.context, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.parent.error(message, error, this.context, metadata);
  }

  fatal(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.parent.fatal(message, error, this.context, metadata);
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Request context middleware
 */
export function setRequestContext(context: {
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
}): void {
  if (typeof global !== 'undefined') {
    (global as any).requestContext = context;
  }
}

/**
 * Clear request context
 */
export function clearRequestContext(): void {
  if (typeof global !== 'undefined') {
    delete (global as any).requestContext;
  }
}

/**
 * Performance logging utility
 */
export class PerformanceLogger {
  private timers: Map<string, number> = new Map();

  start(name: string): void {
    this.timers.set(name, Date.now());
  }

  end(name: string, context?: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      logger.warn(`Timer '${name}' not found`, context);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);

    logger.info(`Performance: ${name} took ${duration}ms`, context, {
      performance: true,
      duration,
      timerName: name
    });

    return duration;
  }

  time<T>(name: string, fn: () => T, context?: string): T {
    this.start(name);
    try {
      const result = fn();
      this.end(name, context);
      return result;
    } catch (error) {
      this.end(name, context);
      throw error;
    }
  }

  async timeAsync<T>(name: string, fn: () => Promise<T>, context?: string): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name, context);
      return result;
    } catch (error) {
      this.end(name, context);
      throw error;
    }
  }
}

export const performanceLogger = new PerformanceLogger();

/**
 * Audit logging utility
 */
export class AuditLogger {
  private auditLogger: Logger;

  constructor() {
    this.auditLogger = new Logger({
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: true,
      enableStructuredOutput: true,
      contexts: ['audit']
    });
  }

  logAction(
    action: string,
    userId: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): void {
    this.auditLogger.info(
      `Audit: ${action} on ${resource}${resourceId ? `:${resourceId}` : ''} by user ${userId}`,
      'audit',
      {
        audit: true,
        action,
        userId,
        resource,
        resourceId,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    );
  }

  logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high',
    details: Record<string, any>
  ): void {
    const level = severity === 'high' ? LogLevel.ERROR : 
                  severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;

    if (level === LogLevel.ERROR) {
      this.auditLogger.error(`Security Event: ${event}`, undefined, 'security', {
        security: true,
        event,
        severity,
        ...details
      });
    } else if (level === LogLevel.WARN) {
      this.auditLogger.warn(`Security Event: ${event}`, 'security', {
        security: true,
        event,
        severity,
        ...details
      });
    } else {
      this.auditLogger.info(`Security Event: ${event}`, 'security', {
        security: true,
        event,
        severity,
        ...details
      });
    }
  }
}

export const auditLogger = new AuditLogger();

/**
 * Export default logger
 */
export default logger;
