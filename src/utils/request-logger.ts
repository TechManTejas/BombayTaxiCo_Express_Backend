/**
 * Request Logger Utility
 * Simple HTTP request logging middleware
 */

import { Request, Response, NextFunction } from 'express';

export interface RequestLog {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
}

export class RequestLogger {
  private logs: RequestLog[] = [];
  private maxLogs: number;

  constructor(maxLogs: number = 1000) {
    this.maxLogs = maxLogs;
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const log: RequestLog = {
          timestamp: new Date().toISOString(),
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          responseTime: Date.now() - startTime,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        };

        this.addLog(log);
      });

      next();
    };
  }

  private addLog(log: RequestLog) {
    this.logs.push(log);
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogs(): RequestLog[] {
    return [...this.logs];
  }

  getLogsByStatus(statusCode: number): RequestLog[] {
    return this.logs.filter(log => log.statusCode === statusCode);
  }

  getLogsByMethod(method: string): RequestLog[] {
    return this.logs.filter(log => log.method === method);
  }

  clearLogs(): void {
    this.logs = [];
  }

  getStats() {
    const total = this.logs.length;
    const success = this.logs.filter(l => l.statusCode < 400).length;
    const errors = this.logs.filter(l => l.statusCode >= 400).length;
    const avgResponseTime = total > 0 
      ? this.logs.reduce((sum, log) => sum + log.responseTime, 0) / total 
      : 0;

    return {
      total,
      success,
      errors,
      avgResponseTime: Math.round(avgResponseTime)
    };
  }
}

export const requestLogger = new RequestLogger();
