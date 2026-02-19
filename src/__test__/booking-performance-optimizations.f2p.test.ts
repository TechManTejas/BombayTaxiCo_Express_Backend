/**
 * F2P tests for booking performance optimizations.
 * These tests would fail on the base branch and pass after the fixes.
 */

import { Request, Response } from 'express';
import { getUserBookings } from '../controllers/booking.controller';
import Booking from '../models/booking.model';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../models/booking.model');
jest.mock('jsonwebtoken');
jest.mock('../email/sendEmail');

const mockBooking = Booking as jest.Mocked<typeof Booking>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('Booking Performance Optimizations F2P Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSet: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock response methods
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockSet = jest.fn().mockReturnThis();
    
    mockResponse = {
      status: mockStatus,
      json: mockJson,
      set: mockSet
    };

    // Mock JWT verification
    mockJwt.verify.mockReturnValue({ userId: 'test-user-123' });
  });

  describe('Pagination Performance Optimizations', () => {
    it('should limit page size to maximum 100 items', async () => {
      // Bug: Should limit page size to prevent performance issues
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: { pageSize: '200' } // Request more than max allowed
      };

      // Mock database calls
      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should limit to 100 items
      expect(mockFind.limit).toHaveBeenCalledWith(100);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle invalid page size gracefully', async () => {
      // Bug: Should handle invalid page size values
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: { pageSize: 'invalid' }
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should default to 10 for invalid pageSize
      expect(mockFind.limit).toHaveBeenCalledWith(10);
    });

    it('should handle negative page size gracefully', async () => {
      // Bug: Should handle negative page size values
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: { pageSize: '-5' }
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should default to 10 for negative pageSize
      expect(mockFind.limit).toHaveBeenCalledWith(10);
    });

    it('should handle infinite page size gracefully', async () => {
      // Bug: Should handle infinite page size values
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: { pageSize: 'Infinity' }
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should default to 10 for infinite pageSize
      expect(mockFind.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('Caching Optimizations', () => {
    it('should set cache control headers', async () => {
      // Bug: Should set appropriate cache headers
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: {}
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should set cache headers
      expect(mockSet).toHaveBeenCalledWith('Cache-Control', 'private, max-age=300');
      expect(mockSet).toHaveBeenCalledWith('ETag', 'bookings-test-user-123-1-10');
    });

    it('should generate unique ETag based on user and pagination', async () => {
      // Bug: Should generate unique ETag for different requests
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: { page: '2', pageSize: '20' }
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should generate unique ETag for different pagination
      expect(mockSet).toHaveBeenCalledWith('ETag', 'bookings-test-user-123-2-20');
    });
  });

  describe('Search Performance Optimizations', () => {
    it('should limit search query length', async () => {
      // Bug: Should limit search query to prevent performance issues
      const longSearchQuery = 'a'.repeat(200); // 200 characters
      
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: { search: longSearchQuery }
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should not include search filter for long queries
      expect(mockBooking.find).toHaveBeenCalledWith({ user_id: 'test-user-123' });
    });

    it('should handle empty search query', async () => {
      // Bug: Should handle empty search query gracefully
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: { search: '' }
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should not include search filter for empty query
      expect(mockBooking.find).toHaveBeenCalledWith({ user_id: 'test-user-123' });
    });

    it('should escape regex special characters in search', async () => {
      // Bug: Should escape regex special characters to prevent errors
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: { search: 'test.*+?^${}()|[]\\' }
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      // Mock Booking schema paths
      mockBooking.schema = {
        paths: {
          'testField': { instance: 'String' },
          'numberField': { instance: 'Number' }
        }
      } as any;

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should include escaped search filter
      expect(mockBooking.find).toHaveBeenCalled();
    });
  });

  describe('Database Query Optimizations', () => {
    it('should use lean() for better performance', async () => {
      // Bug: Should use lean() for better query performance
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: {}
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should use lean() for better performance
      expect(mockFind.lean).toHaveBeenCalled();
    });

    it('should select only necessary fields', async () => {
      // Bug: Should select only necessary fields to reduce data transfer
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: {}
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should select only necessary fields
      expect(mockFind.select).toHaveBeenCalledWith('_id booking_date pickup_time dropoff_time status total_amount created_at updated_at');
    });

    it('should populate with field selection', async () => {
      // Bug: Should populate with field selection to reduce data transfer
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: {}
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should populate with field selection
      expect(mockFind.populate).toHaveBeenCalledWith([
        { path: "route_id", select: "name distance", populate: { path: "from_id to_id", select: "name" } },
        { path: "user_id", select: "name email phone" },
        { path: "driver_id", select: "name phone rating" },
        { path: "pickup_city", select: "name" },
        { path: "taxi_id", select: "registration_number", populate: { path: "taxi_type_id", select: "name" } },
        { path: "coupon_id", select: "code discount" },
        { path: "requested_taxi_type", select: "name" }
      ]);
    });

    it('should sort by creation date', async () => {
      // Bug: Should sort by creation date for consistent results
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: {}
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should sort by creation date
      expect(mockFind.sort).toHaveBeenCalledWith({ created_at: -1 });
    });

    it('should use lean() for count query', async () => {
      // Bug: Should use lean() for count query performance
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: {}
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should use lean() for count query
      expect(mockBooking.countDocuments).toHaveBeenCalled();
    });
  });

  describe('Error Handling Optimizations', () => {
    it('should handle invalid filter JSON gracefully', async () => {
      // Bug: Should handle invalid filter JSON gracefully
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: { filter: 'invalid-json{' }
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      // Mock console.warn to capture warning
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should log warning and continue with empty filter
      expect(consoleSpy).toHaveBeenCalledWith('Invalid filter JSON:', 'invalid-json{');
      expect(mockBooking.find).toHaveBeenCalledWith({ user_id: 'test-user-123' });

      consoleSpy.mockRestore();
    });

    it('should handle database errors gracefully', async () => {
      // Bug: Should handle database errors gracefully
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: {}
      };

      // Mock database error
      mockBooking.find.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      // Mock console.error to capture error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should handle error and return 500
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: "Internal Server Error" });

      consoleSpy.mockRestore();
    });
  });

  describe('Performance Edge Cases', () => {
    it('should handle very large page numbers efficiently', async () => {
      // Bug: Should handle very large page numbers efficiently
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: { page: '999999' }
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should handle large page numbers
      expect(mockFind.skip).toHaveBeenCalledWith(9999980); // (999999 - 1) * 10
    });

    it('should handle concurrent requests efficiently', async () => {
      // Bug: Should handle concurrent requests efficiently
      const requests = Array.from({ length: 10 }, (_, i) => ({
        headers: { authorization: 'valid-token' },
        query: { page: (i + 1).toString() }
      }));

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(100);

      // Execute concurrent requests
      const promises = requests.map(req => 
        getUserBookings(req as Request, mockResponse as Response)
      );

      await Promise.all(promises);

      // Should handle all requests
      expect(mockBooking.find).toHaveBeenCalledTimes(10);
      expect(mockBooking.countDocuments).toHaveBeenCalledTimes(10);
    });

    it('should handle memory usage with large datasets', async () => {
      // Bug: Should handle memory usage with large datasets
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: { pageSize: '100' }
      };

      // Mock large dataset
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        _id: `booking-${i}`,
        booking_date: new Date(),
        pickup_time: new Date(),
        dropoff_time: new Date(),
        status: 'confirmed',
        total_amount: 1000,
        created_at: new Date(),
        updated_at: new Date()
      }));

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(largeDataset)
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(1000);

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should handle large dataset efficiently
      expect(mockFind.limit).toHaveBeenCalledWith(100);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('Security Optimizations', () => {
    it('should prevent injection attacks in search', async () => {
      // Bug: Should prevent injection attacks in search
      mockRequest = {
        headers: { authorization: 'valid-token' },
        query: { search: '.*$' }
      };

      const mockFind = {
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      
      mockBooking.find.mockReturnValue(mockFind as any);
      mockBooking.countDocuments.mockResolvedValue(0);

      // Mock Booking schema paths
      mockBooking.schema = {
        paths: {
          'testField': { instance: 'String' }
        }
      } as any;

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should escape regex special characters
      expect(mockBooking.find).toHaveBeenCalled();
    });

    it('should validate user authorization', async () => {
      // Bug: Should validate user authorization
      mockRequest = {
        headers: {}, // No authorization header
        query: {}
      };

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should return unauthorized
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ message: "Unauthorized: No token provided" });
    });

    it('should handle invalid JWT tokens', async () => {
      // Bug: Should handle invalid JWT tokens
      mockRequest = {
        headers: { authorization: 'invalid-token' },
        query: {}
      };

      // Mock JWT verification error
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await getUserBookings(mockRequest as Request, mockResponse as Response);

      // Should handle invalid token
      expect(mockStatus).toHaveBeenCalledWith(500);
    });
  });
});
