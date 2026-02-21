/**
 * F2P Integration Tests for Booking System
 * Tests that fail on base branch and pass after implementation
 */

import request from 'supertest';
import express from 'express';
import BookingService from '../services/booking.service';
import BookingController from '../controllers/booking.controller.new';
import bookingRoutes from '../routes/booking.routes.new';
import { authenticateToken } from '../middleware/auth.middleware';

// Mock dependencies
jest.mock('../services/booking.service');
jest.mock('../middleware/auth.middleware');

const mockBookingService = BookingService as jest.Mocked<typeof BookingService>;
const mockAuthenticateToken = authenticateToken as jest.MockedFunction<typeof authenticateToken>;

describe('Booking System Integration - F2P Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware to always pass
    mockAuthenticateToken.mockImplementation((req, res, next) => {
      (req as any).user = { id: 'user123', role: 'user' };
      next();
    });

    app.use('/api/bookings', bookingRoutes);
    jest.clearAllMocks();
  });

  describe('Complete Booking Flow - F2P Tests', () => {
    const bookingData = {
      userId: '507f1f77bcf86cd799439011',
      taxiId: '507f1f77bcf86cd799439012',
      pickupAddress: '123 Main St',
      dropAddress: '456 Oak Ave',
      pickupDate: new Date(Date.now() + 86400000),
      pickupTime: '10:00',
      tripType: 'One-Way Trip',
      baseFare: 50,
      name: 'John Doe',
      emailId: 'john@example.com',
      contactNumber: '+1234567890',
      whatsAppNumber: '+1234567890',
      address: '123 Main St, City',
      numberOfPassengers: '2',
      numberOfSmallBags: '1',
      numberOfLargeBags: '0',
      gender: 'Male',
      seniorCitizen: false,
      womenTraveling: false,
      kidsOnBoard: false,
      englishSpeakingDriver: true,
      carryingPet: false,
      need7Plus1Seater: false,
      carrierOverTop: false,
      bookingForSomeoneElse: false,
      otherDetails: 'Test booking'
    };

    it('F2P: should handle complete booking lifecycle', async () => {
      const mockBooking = {
        _id: 'booking123',
        ...bookingData,
        booking_status: 'New',
        total_cost: 50
      };

      // Mock service responses
      mockBookingService.getInstance.mockReturnValue({
        createBooking: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking created successfully',
          data: mockBooking
        }),
        getBookingById: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking retrieved successfully',
          data: mockBooking
        }),
        confirmBooking: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking confirmed successfully',
          data: { ...mockBooking, booking_status: 'Confirmed', driver_id: 'driver123' }
        }),
        startTrip: jest.fn().mockResolvedValue({
          success: true,
          message: 'Trip started successfully',
          data: { ...mockBooking, booking_status: 'On Ride' }
        }),
        completeTrip: jest.fn().mockResolvedValue({
          success: true,
          message: 'Trip completed successfully',
          data: { ...mockBooking, booking_status: 'Completed', total_cost: 65 }
        })
      } as any);

      // Step 1: Create booking
      const createResponse = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data._id).toBe('booking123');
      expect(createResponse.body.data.booking_status).toBe('New');

      // Step 2: Get booking by ID
      const getResponse = await request(app)
        .get('/api/bookings/booking123')
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data._id).toBe('booking123');

      // Step 3: Confirm booking
      const confirmResponse = await request(app)
        .post('/api/bookings/booking123/confirm')
        .send({ driverId: 'driver123' })
        .expect(200);

      expect(confirmResponse.body.success).toBe(true);
      expect(confirmResponse.body.data.booking_status).toBe('Confirmed');
      expect(confirmResponse.body.data.driver_id).toBe('driver123');

      // Step 4: Start trip
      const startResponse = await request(app)
        .post('/api/bookings/booking123/start')
        .expect(200);

      expect(startResponse.body.success).toBe(true);
      expect(startResponse.body.data.booking_status).toBe('On Ride');

      // Step 5: Complete trip
      const completeResponse = await request(app)
        .post('/api/bookings/booking123/complete')
        .send({ waitingCharges: 10, otherCharges: 5 })
        .expect(200);

      expect(completeResponse.body.success).toBe(true);
      expect(completeResponse.body.data.booking_status).toBe('Completed');
      expect(completeResponse.body.data.total_cost).toBe(65);
    });

    it('F2P: should handle booking cancellation flow', async () => {
      const mockBooking = {
        _id: 'booking123',
        ...bookingData,
        booking_status: 'Confirmed'
      };

      mockBookingService.getInstance.mockReturnValue({
        createBooking: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking created successfully',
          data: mockBooking
        }),
        cancelBooking: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking cancelled successfully',
          data: { ...mockBooking, booking_status: 'CancelledByUser' }
        })
      } as any);

      // Create booking
      await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      // Cancel booking
      const cancelResponse = await request(app)
        .post('/api/bookings/booking123/cancel')
        .send({ reason: 'Customer request' })
        .expect(200);

      expect(cancelResponse.body.success).toBe(true);
      expect(cancelResponse.body.data.booking_status).toBe('CancelledByUser');
    });
  });

  describe('Error Handling Integration - F2P Tests', () => {
    it('F2P: should handle validation errors in create booking', async () => {
      const invalidBookingData = {
        // Missing required fields
        userId: 'user123'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidBookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Missing required fields');
    });

    it('F2P: should handle service errors gracefully', async () => {
      mockBookingService.getInstance.mockReturnValue({
        createBooking: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      } as any);

      const response = await request(app)
        .post('/api/bookings')
        .send({
          userId: '507f1f77bcf86cd799439011',
          taxiId: '507f1f77bcf86cd799439012',
          pickupAddress: '123 Main St',
          dropAddress: '456 Oak Ave',
          pickupDate: new Date(Date.now() + 86400000),
          pickupTime: '10:00',
          tripType: 'One-Way Trip',
          baseFare: 50,
          name: 'John Doe',
          emailId: 'john@example.com',
          contactNumber: '+1234567890',
          address: '123 Main St, City',
          numberOfPassengers: '2',
          gender: 'Male',
          seniorCitizen: false,
          womenTraveling: false,
          kidsOnBoard: false,
          englishSpeakingDriver: true,
          carryingPet: false,
          need7Plus1Seater: false,
          carrierOverTop: false,
          bookingForSomeoneElse: false,
          otherDetails: 'Test booking'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Internal server error');
    });

    it('F2P: should handle not found errors', async () => {
      mockBookingService.getInstance.mockReturnValue({
        getBookingById: jest.fn().mockResolvedValue({
          success: false,
          message: 'Booking not found',
          error: 'BOOKING_NOT_FOUND'
        })
      } as any);

      const response = await request(app)
        .get('/api/bookings/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('BOOKING_NOT_FOUND');
    });
  });

  describe('Authentication Integration - F2P Tests', () => {
    it('F2P: should require authentication for all endpoints', async () => {
      // Mock authentication to fail
      mockAuthenticateToken.mockImplementation((req, res, next) => {
        res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .get('/api/bookings')
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });

    it('F2P: should pass authentication with valid token', async () => {
      // Mock authentication to succeed
      mockAuthenticateToken.mockImplementation((req, res, next) => {
        (req as any).user = { id: 'user123', role: 'user' };
        next();
      });

      mockBookingService.getInstance.mockReturnValue({
        getBookings: jest.fn().mockResolvedValue({
          success: true,
          message: 'Bookings retrieved successfully',
          data: { bookings: [], total: 0, page: 1, totalPages: 0 }
        })
      } as any);

      const response = await request(app)
        .get('/api/bookings')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Pagination and Filtering Integration - F2P Tests', () => {
    it('F2P: should handle pagination parameters correctly', async () => {
      mockBookingService.getInstance.mockReturnValue({
        getBookings: jest.fn().mockResolvedValue({
          success: true,
          message: 'Bookings retrieved successfully',
          data: {
            bookings: [{ _id: 'booking1' }, { _id: 'booking2' }],
            total: 25,
            page: 2,
            totalPages: 13
          }
        })
      } as any);

      const response = await request(app)
        .get('/api/bookings?page=2&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.page).toBe(2);
      expect(response.body.data.limit).toBeUndefined(); // limit is not returned in response
      expect(response.body.data.totalPages).toBe(13);
    });

    it('F2P: should handle filtering parameters correctly', async () => {
      mockBookingService.getInstance.mockReturnValue({
        getBookings: jest.fn().mockResolvedValue({
          success: true,
          message: 'Bookings retrieved successfully',
          data: {
            bookings: [{ _id: 'booking1' }],
            total: 1,
            page: 1,
            totalPages: 1
          }
        })
      } as any);

      const response = await request(app)
        .get('/api/bookings?userId=user123&bookingStatus=Confirmed&minAmount=10&maxAmount=100')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockBookingService.getInstance().getBookings).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          bookingStatus: ['Confirmed'],
          minAmount: 10,
          maxAmount: 100
        }),
        1,
        20
      );
    });
  });

  describe('Statistics Integration - F2P Tests', () => {
    it('F2P: should return booking statistics', async () => {
      mockBookingService.getInstance.mockReturnValue({
        getBookingStats: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking statistics retrieved successfully',
          data: {
            totalBookings: 100,
            completedBookings: 80,
            cancelledBookings: 15,
            newBookings: 5,
            totalRevenue: 5000,
            averageFare: 50,
            completionRate: 80,
            cancellationRate: 15
          }
        })
      } as any);

      const response = await request(app)
        .get('/api/bookings/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalBookings).toBe(100);
      expect(response.body.data.completionRate).toBe(80);
      expect(response.body.data.cancellationRate).toBe(15);
    });

    it('F2P: should handle statistics with filters', async () => {
      mockBookingService.getInstance.mockReturnValue({
        getBookingStats: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking statistics retrieved successfully',
          data: {
            totalBookings: 50,
            completedBookings: 45,
            cancelledBookings: 5,
            newBookings: 0,
            totalRevenue: 2500,
            averageFare: 50,
            completionRate: 90,
            cancellationRate: 10
          }
        })
      } as any);

      const response = await request(app)
        .get('/api/bookings/stats?userId=user123&dateFrom=2023-01-01&dateTo=2023-12-31')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockBookingService.getInstance().getBookingStats).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          dateFrom: expect.any(Date),
          dateTo: expect.any(Date)
        })
      );
    });
  });

  describe('User and Driver History Integration - F2P Tests', () => {
    it('F2P: should return user booking history', async () => {
      mockBookingService.getInstance.mockReturnValue({
        getUserBookingHistory: jest.fn().mockResolvedValue({
          success: true,
          message: 'User booking history retrieved successfully',
          data: {
            bookings: [{ _id: 'booking1' }, { _id: 'booking2' }],
            total: 2,
            page: 1,
            totalPages: 1
          }
        })
      } as any);

      const response = await request(app)
        .get('/api/users/user123/bookings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toHaveLength(2);
      expect(mockBookingService.getInstance().getUserBookingHistory).toHaveBeenCalledWith('user123', 1, 20);
    });

    it('F2P: should return driver booking history', async () => {
      mockBookingService.getInstance.mockReturnValue({
        getDriverBookingHistory: jest.fn().mockResolvedValue({
          success: true,
          message: 'Driver booking history retrieved successfully',
          data: {
            bookings: [{ _id: 'booking3' }, { _id: 'booking4' }, { _id: 'booking5' }],
            total: 3,
            page: 1,
            totalPages: 1
          }
        })
      } as any);

      const response = await request(app)
        .get('/api/drivers/driver123/bookings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toHaveLength(3);
      expect(mockBookingService.getInstance().getDriverBookingHistory).toHaveBeenCalledWith('driver123', 1, 20);
    });

    it('F2P: should handle pagination in history endpoints', async () => {
      mockBookingService.getInstance.mockReturnValue({
        getUserBookingHistory: jest.fn().mockResolvedValue({
          success: true,
          message: 'User booking history retrieved successfully',
          data: {
            bookings: [{ _id: 'booking1' }],
            total: 10,
            page: 2,
            totalPages: 5
          }
        })
      } as any);

      const response = await request(app)
        .get('/api/users/user123/bookings?page=2&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.page).toBe(2);
      expect(mockBookingService.getInstance().getUserBookingHistory).toHaveBeenCalledWith('user123', 2, 5);
    });
  });

  describe('Response Format Integration - F2P Tests', () => {
    it('F2P: should include timestamp in all successful responses', async () => {
      mockBookingService.getInstance.mockReturnValue({
        getBookings: jest.fn().mockResolvedValue({
          success: true,
          message: 'Bookings retrieved successfully',
          data: { bookings: [], total: 0, page: 1, totalPages: 0 }
        })
      } as any);

      const response = await request(app)
        .get('/api/bookings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.timestamp).toBeDefined();
      expect(typeof response.body.timestamp).toBe('string');
    });

    it('F2P: should include timestamp in all error responses', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.timestamp).toBeDefined();
      expect(typeof response.body.timestamp).toBe('string');
    });

    it('F2P: should maintain consistent response structure', async () => {
      mockBookingService.getInstance.mockReturnValue({
        createBooking: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking created successfully',
          data: { _id: 'booking123' }
        })
      } as any);

      const response = await request(app)
        .post('/api/bookings')
        .send({
          userId: '507f1f77bcf86cd799439011',
          taxiId: '507f1f77bcf86cd799439012',
          pickupAddress: '123 Main St',
          dropAddress: '456 Oak Ave',
          pickupDate: new Date(Date.now() + 86400000),
          pickupTime: '10:00',
          tripType: 'One-Way Trip',
          baseFare: 50,
          name: 'John Doe',
          emailId: 'john@example.com',
          contactNumber: '+1234567890',
          address: '123 Main St, City',
          numberOfPassengers: '2',
          gender: 'Male',
          seniorCitizen: false,
          womenTraveling: false,
          kidsOnBoard: false,
          englishSpeakingDriver: true,
          carryingPet: false,
          need7Plus1Seater: false,
          carrierOverTop: false,
          bookingForSomeoneElse: false,
          otherDetails: 'Test booking'
        })
        .expect(201);

      // Check for required response fields
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.success).toBe('boolean');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.timestamp).toBe('string');
    });
  });
});
