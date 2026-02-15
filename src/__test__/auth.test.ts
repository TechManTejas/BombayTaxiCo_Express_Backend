import {
  generateAccessToken,
  generateRefreshToken,
  generateAuthTokens,
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  extractTokenFromHeader,
  authenticateToken,
  authorizeRoles,
  generateSecureToken,
  createPasswordResetToken,
  validatePasswordResetToken,
  AuthRateLimiter,
  JwtPayload
} from '../utils/auth';

// Mock JWT for testing
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-token'),
  verify: jest.fn((token, secret) => {
    if (token === 'valid-token') {
      return { userId: '123', email: 'test@example.com', role: 'user' };
    }
    throw new Error('Invalid token');
  })
}));

describe('Authentication Utilities', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  describe('generateAccessToken', () => {
    it('should generate access token', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'user' };
      const token = generateAccessToken(payload);
      
      expect(token).toBe('mock-token');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'user' };
      const token = generateRefreshToken(payload);
      
      expect(token).toBe('mock-token');
    });
  });

  describe('generateAuthTokens', () => {
    it('should generate both access and refresh tokens', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'user' };
      const tokens = generateAuthTokens(payload);
      
      expect(tokens.accessToken).toBe('mock-token');
      expect(tokens.refreshToken).toBe('mock-token');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = 'valid-token';
      const decoded = verifyAccessToken(token);
      
      expect(decoded.userId).toBe('123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('user');
    });

    it('should throw error for invalid token', () => {
      const token = 'invalid-token';
      
      expect(() => verifyAccessToken(token)).toThrow('Invalid or expired access token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = 'valid-token';
      const decoded = verifyRefreshToken(token);
      
      expect(decoded.userId).toBe('123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('user');
    });

    it('should throw error for invalid token', () => {
      const token = 'invalid-token';
      
      expect(() => verifyRefreshToken(token)).toThrow('Invalid or expired refresh token');
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'testpassword';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });
  });

  describe('comparePassword', () => {
    it('should compare matching password', async () => {
      const password = 'testpassword';
      const hash = await hashPassword(password);
      
      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should reject non-matching password', async () => {
      const password = 'testpassword';
      const wrongPassword = 'wrongpassword';
      const hash = await hashPassword(password);
      
      const result = await comparePassword(wrongPassword, hash);
      expect(result).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const password = 'StrongP@ss123';
      const result = validatePasswordStrength(password);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject password that is too short', () => {
      const password = 'Short1!';
      const result = validatePasswordStrength(password);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase', () => {
      const password = 'weakp@ss123';
      const result = validatePasswordStrength(password);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const password = 'STRONG@123';
      const result = validatePasswordStrength(password);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without numbers', () => {
      const password = 'StrongPassword!';
      const result = validatePasswordStrength(password);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special characters', () => {
      const password = 'StrongPassword123';
      const result = validatePasswordStrength(password);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const header = 'Bearer valid-token';
      const token = extractTokenFromHeader(header);
      
      expect(token).toBe('valid-token');
    });

    it('should return null for missing header', () => {
      const token = extractTokenFromHeader(undefined);
      expect(token).toBeNull();
    });

    it('should return null for invalid header format', () => {
      const header = 'Basic valid-token';
      const token = extractTokenFromHeader(header);
      expect(token).toBeNull();
    });

    it('should return null for header without token', () => {
      const header = 'Bearer';
      const token = extractTokenFromHeader(header);
      expect(token).toBeNull();
    });
  });

  describe('authenticateToken middleware', () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: jest.Mock;

    beforeEach(() => {
      mockReq = {
        headers: {}
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
    });

    it('should authenticate valid token', () => {
      mockReq.headers.authorization = 'Bearer valid-token';
      
      authenticateToken(mockReq, mockRes, mockNext);
      
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.userId).toBe('123');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject missing token', () => {
      authenticateToken(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token required',
        error: 'MISSING_TOKEN'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      
      authenticateToken(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorizeRoles middleware', () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: jest.Mock;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
    });

    it('should authorize user with correct role', () => {
      mockReq.user = { userId: '123', email: 'test@example.com', role: 'admin' };
      
      const middleware = authorizeRoles('admin', 'manager');
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject user without correct role', () => {
      mockReq.user = { userId: '123', email: 'test@example.com', role: 'user' };
      
      const middleware = authorizeRoles('admin', 'manager');
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated user', () => {
      const middleware = authorizeRoles('admin');
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('generateSecureToken', () => {
    it('should generate token with default length', () => {
      const token = generateSecureToken();
      
      expect(token).toHaveLength(32);
      expect(/^[A-Za-z0-9]+$/.test(token)).toBe(true);
    });

    it('should generate token with custom length', () => {
      const token = generateSecureToken(16);
      
      expect(token).toHaveLength(16);
      expect(/^[A-Za-z0-9]+$/.test(token)).toBe(true);
    });

    it('should generate different tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('createPasswordResetToken', () => {
    it('should create password reset token', () => {
      const { token, expiry } = createPasswordResetToken();
      
      expect(token).toBeDefined();
      expect(token).toHaveLength(32);
      expect(expiry).toBeInstanceOf(Date);
      expect(expiry.getTime()).toBeGreaterThan(Date.now());
    });

    it('should set expiry to 1 hour from now', () => {
      const { expiry } = createPasswordResetToken();
      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + 60 * 60 * 1000);
      
      expect(expiry.getTime()).toBeCloseTo(expectedExpiry.getTime(), -3);
    });
  });

  describe('validatePasswordResetToken', () => {
    it('should validate valid token', () => {
      const { token, expiry } = createPasswordResetToken();
      
      const result = validatePasswordResetToken(token, expiry);
      expect(result).toBe(true);
    });

    it('should reject expired token', () => {
      const pastExpiry = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      
      const result = validatePasswordResetToken('valid-token', pastExpiry);
      expect(result).toBe(false);
    });

    it('should reject null token', () => {
      const result = validatePasswordResetToken(null as any, new Date());
      expect(result).toBe(false);
    });

    it('should reject null expiry', () => {
      const result = validatePasswordResetToken('valid-token', null as any);
      expect(result).toBe(false);
    });
  });

  describe('AuthRateLimiter', () => {
    let rateLimiter: AuthRateLimiter;

    beforeEach(() => {
      rateLimiter = new AuthRateLimiter(5, 60000); // 5 requests per minute
    });

    it('should not block user initially', () => {
      const result = rateLimiter.isBlocked('user1');
      expect(result).toBe(false);
    });

    it('should record attempts correctly', () => {
      const result1 = rateLimiter.recordAttempt('user1');
      expect(result1.blocked).toBe(false);
      expect(result1.remainingAttempts).toBe(4);

      const result2 = rateLimiter.recordAttempt('user1');
      expect(result2.blocked).toBe(false);
      expect(result2.remainingAttempts).toBe(3);
    });

    it('should block after max attempts', () => {
      // Make 5 attempts
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordAttempt('user1');
      }
      
      // 6th attempt should be blocked
      const result = rateLimiter.recordAttempt('user1');
      expect(result.blocked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
      
      // User should be blocked
      expect(rateLimiter.isBlocked('user1')).toBe(true);
    });

    it('should handle different users separately', () => {
      // User1 makes 5 attempts
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordAttempt('user1');
      }
      
      // User1 should be blocked
      expect(rateLimiter.isBlocked('user1')).toBe(true);
      
      // User2 should not be blocked
      expect(rateLimiter.isBlocked('user2')).toBe(false);
    });

    it('should reset attempts for specific user', () => {
      // Make some attempts
      for (let i = 0; i < 3; i++) {
        rateLimiter.recordAttempt('user1');
      }
      
      // Reset user
      rateLimiter.resetAttempts('user1');
      
      // User should not be blocked and should have full attempts again
      expect(rateLimiter.isBlocked('user1')).toBe(false);
      
      const result = rateLimiter.recordAttempt('user1');
      expect(result.blocked).toBe(false);
      expect(result.remainingAttempts).toBe(4);
    });
  });
});
