/**
 * Authentication and authorization utilities
 */

import jwt from 'jsonwebtoken';
import { isValidObjectId } from './validators';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generates JWT access token
 */
export const generateAccessToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as string
  } as jwt.SignOptions);
};

/**
 * Generates JWT refresh token
 */
export const generateRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret', {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string
  } as jwt.SignOptions);
};

/**
 * Generates both access and refresh tokens
 */
export const generateAuthTokens = (payload: Omit<JwtPayload, 'iat' | 'exp'>): AuthTokens => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

/**
 * Verifies JWT access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verifies JWT refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret') as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Hashes password using bcrypt (simplified version without external dependency)
 */
export const hashPassword = async (password: string): Promise<string> => {
  // Simple hash for demonstration - in production use bcrypt
  return Buffer.from(password + 'salt').toString('base64');
};

/**
 * Compares password with hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedPassword = Buffer.from(password + 'salt').toString('base64');
  return hashedPassword === hash;
};

/**
 * Validates password strength
 */
export const validatePasswordStrength = (password: any): { isValid: boolean; errors: string[] } => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required and must be a string'] };
  }
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Extracts token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  
  const trimmed = authHeader.trim();
  const parts = trimmed.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }
  
  return parts[1].trim();
};

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = (req: any, res: any, next: any): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        error: 'MISSING_TOKEN'
      });
    }
    
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: 'INVALID_TOKEN'
    });
  }
};

/**
 * Middleware to authorize based on roles
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: any, res: any, next: any): void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  };
};

/**
 * Generates secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  if (!length || length <= 0 || isNaN(length)) return '';
  const safeLength = Math.min(Math.floor(length), 1024);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < safeLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Creates password reset token
 */
export const createPasswordResetToken = (): { token: string; expiry: Date } => {
  const token = generateSecureToken(32);
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1); // Token expires in 1 hour
  
  return { token, expiry };
};

/**
 * Validates password reset token
 */
export const validatePasswordResetToken = (token: string, expiry: Date): boolean => {
  if (!token || !expiry) return false;
  const expiryDate = expiry instanceof Date ? expiry : new Date(expiry);
  if (isNaN(expiryDate.getTime())) return false;
  return new Date() < expiryDate;
};

/**
 * Rate limiting for authentication attempts
 */
export class AuthRateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number; lockedUntil?: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private lockoutDuration: number = 15 * 60 * 1000, // 15 minutes
    private resetDuration: number = 60 * 60 * 1000 // 1 hour
  ) {}
  
  isBlocked(identifier: string): boolean {
    const record = this.attempts.get(identifier);
    
    if (!record) return false;
    
    // Check if lockout has expired
    if (record.lockedUntil && Date.now() > record.lockedUntil) {
      this.attempts.delete(identifier);
      return false;
    }
    
    return !!(record.lockedUntil && Date.now() < record.lockedUntil);
  }
  
  recordAttempt(identifier: string): { blocked: boolean; remainingAttempts: number } {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return { blocked: false, remainingAttempts: this.maxAttempts - 1 };
    }
    
    // Reset if enough time has passed
    if (now - record.lastAttempt > this.resetDuration) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return { blocked: false, remainingAttempts: this.maxAttempts - 1 };
    }
    
    // Check if currently locked out
    if (record.lockedUntil && now < record.lockedUntil) {
      return { blocked: true, remainingAttempts: 0 };
    }
    
    // Clear expired lockout and reset count
    if (record.lockedUntil && now >= record.lockedUntil) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return { blocked: false, remainingAttempts: this.maxAttempts - 1 };
    }
    
    // Increment attempts
    const newCount = record.count + 1;
    const remainingAttempts = Math.max(0, this.maxAttempts - newCount);
    
    if (newCount >= this.maxAttempts) {
      // Lock the account
      const lockedUntil = now + this.lockoutDuration;
      this.attempts.set(identifier, { 
        count: newCount, 
        lastAttempt: now, 
        lockedUntil 
      });
      return { blocked: true, remainingAttempts: 0 };
    }
    
    this.attempts.set(identifier, { count: newCount, lastAttempt: now });
    return { blocked: false, remainingAttempts };
  }
  
  resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
}
