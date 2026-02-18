// Import necessary libraries and modules
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Middleware for token authentication with security enhancements
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // Extract the token from the request headers
  const authHeader = req.header('Authorization');

  // Check if the token is present
  if (!authHeader) {
    res.status(401).json({ message: 'Unauthorized - Token not provided' });
    return;
  }

  // Validate token format
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized - Invalid token format' });
    return;
  }

  // Strip Bearer prefix
  const token = authHeader.slice(7);

  // Validate token contains only valid JWT characters
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    res.status(401).json({ message: 'Unauthorized - Invalid token structure' });
    return;
  }

  // Validate token length (JWT tokens are typically 100-500 characters)
  if (token.length < 100 || token.length > 1000) {
    res.status(401).json({ message: 'Unauthorized - Invalid token length' });
    return;
  }

  // Verify the token with enhanced error handling
  jwt.verify(token, process.env.JWT_SECRET_KEY || 'your-secret-key', {
    algorithms: ['HS256'], // Specify allowed algorithms
    clockTolerance: 30, // Allow 30 seconds clock skew
  }, (err, decoded) => {
    if (err) {
      // Log security events without exposing sensitive information
      console.warn(`Authentication failed: ${err.name} at ${new Date().toISOString()}`);
      
      // Generic error message to prevent token enumeration
      res.status(401).json({ message: 'Unauthorized - Invalid token' });
      return;
    }

    // Validate decoded token structure
    if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
      res.status(401).json({ message: 'Unauthorized - Invalid token payload' });
      return;
    }

    // Validate userId is a string or number
    const userId = (decoded as any).userId;
    if (typeof userId !== 'string' && typeof userId !== 'number') {
      res.status(401).json({ message: 'Unauthorized - Invalid user identifier' });
      return;
    }

    // Attach the user information to the request
    (req as any).userId = userId;
    (req as any).tokenPayload = decoded;

    // Continue to the next middleware or route handler
    next();
  });
};

// Middleware to validate JWT secret key is properly configured
export const validateJwtConfig = (req: Request, res: Response, next: NextFunction): void => {
  const jwtSecret = process.env.JWT_SECRET_KEY;
  
  if (!jwtSecret || jwtSecret === 'your-secret-key' || jwtSecret.length < 32) {
    console.error('JWT_SECRET_KEY is not properly configured');
    res.status(500).json({ message: 'Server configuration error' });
    return;
  }
  
  next();
};

// Middleware to add security headers
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  // Strict Transport Security (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};
