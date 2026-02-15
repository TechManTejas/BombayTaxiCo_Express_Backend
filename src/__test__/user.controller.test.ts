import { Request, Response } from 'express';
import { verifyOTP, registerUser, getUserDetails } from '../../controllers/user.controller';
import User from '../../models/user.model';

// Mock dependencies
jest.mock('../../models/user.model');
jest.mock('../../twilio/client');

describe('User Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyOTP', () => {
    it('should verify OTP and register user successfully', async () => {
      mockReq = {
        body: { otp: '123456' }
      };

      // Mock User constructor and save
      const mockUser = {
        _id: 'user123',
        mobile_no: '1234567890',
        email_id: 'test@example.com',
        name: 'Test User'
      };

      (User as jest.Mock).mockImplementation(() => mockUser);
      mockUser.save = jest.fn().mockResolvedValue(mockUser);

      // Mock jwt
      jest.doMock('jsonwebtoken', () => ({
        sign: jest.fn().mockReturnValue('mock-token')
      }));

      await verifyOTP(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User registered and signed in successfully",
        token: "mock-token",
        user: {
          _id: "user123",
          name: "Test User",
          email: "test@example.com",
          mobile_no: "1234567890"
        }
      });
    });

    it('should return error for invalid OTP', async () => {
      mockReq = {
        body: { otp: '999999' }
      };

      await verifyOTP(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Invalid or expired OTP."
      });
    });
  });

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      mockReq = {
        body: {
          mobile_no: '1234567890',
          email_id: 'test@example.com',
          name: 'Test User'
        }
      };

      const mockUser = {
        _id: 'user123',
        save: jest.fn().mockResolvedValue(undefined)
      };

      (User as jest.Mock).mockImplementation(() => mockUser);

      await registerUser(mockReq as Request, mockRes as Response);

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User registered successfully"
      });
    });

    it('should handle registration errors', async () => {
      mockReq = {
        body: {
          mobile_no: '1234567890',
          email_id: 'test@example.com',
          name: 'Test User'
        }
      };

      const mockUser = {
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      (User as jest.Mock).mockImplementation(() => mockUser);

      await registerUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Internal Server Error"
      });
    });
  });

  describe('getUserDetails', () => {
    it('should get user details successfully', async () => {
      mockReq = {
        userId: 'user123'
      };

      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email_id: 'test@example.com',
        mobile_no: '1234567890'
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await getUserDetails(mockReq as Request, mockRes as Response);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User details retrieved successfully"
      });
    });

    it('should return error if user not found', async () => {
      mockReq = {
        userId: 'nonexistent'
      };

      (User.findById as jest.Mock).mockResolvedValue(null);

      await getUserDetails(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User not found"
      });
    });
  });
});
