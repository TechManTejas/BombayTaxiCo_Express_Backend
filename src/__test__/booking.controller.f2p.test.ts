/**
 * F2P Tests for Booking Controller
 * Tests that fail on base branch and pass after implementation
 */

import { Request, Response } from 'express';
import BookingController from '../controllers/booking.controller.new';
import BookingService from '../services/booking.service';

// Mock the BookingService
jest.mock('../services/booking.service');

const mockBookingService = BookingService as jest.Mocked<typeof BookingService>;

describe('BookingController - F2P Tests', () => {
  let bookingController: BookingController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    bookingController = new BookingController();
    jest.clearAllMocks();

    mockRequest = {
      params: {},
      body: {},
      query: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('createBooking - F2P Tests', () => {
    const validBookingRequest = {
      userId: 'user123',
      taxiId: 'taxi123',
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

    it('F2P: should create booking successfully and return 201', async () => {
      mockRequest.body = validBookingRequest;
      
      mockBookingService.getInstance.mockReturnValue({
        createBooking: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking created successfully',
          data: { _id: 'booking123', ...validBookingRequest }
        })
      } as any);

      await bookingController.createBooking(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Booking created successfully',
        data: { _id: 'booking123', ...validBookingRequest },
        timestamp: expect.any(String)
      });
    });

    it('F2P: should return 400 for missing required fields', async () => {
      mockRequest.body = {
        userId: 'user123'
        // Missing other required fields
      };

      await bookingController.createBooking(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required fields',
        timestamp: expect.any(String)
      });
    });

    it('F2P: should return 400 when service returns failure', async () => {
      mockRequest.body = validBookingRequest;
      
      mockBookingService.getInstance.mockReturnValue({
        createBooking: jest.fn().mockResolvedValue({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        })
      } as any);

      await bookingController.createBooking(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
        timestamp: expect.any(String)
      });
    });

    it('F2P: should return 500 for internal server error', async () => {
      mockRequest.body = validBookingRequest;
      
      mockBookingService.getInstance.mockReturnValue({
        createBooking: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any);

      await bookingController.createBooking(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        timestamp: expect.any(String)
      });
    });
  });

  describe('updateBooking - F2P Tests', () => {
    it('F2P: should update booking successfully', async () => {
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = { bookingStatus: 'Confirmed' };
      
      mockBookingService.getInstance.mockReturnValue({
        updateBooking: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking updated successfully',
          data: { _id: 'booking123', booking_status: 'Confirmed' }
        })
      } as any);

      await bookingController.updateBooking(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Booking updated successfully',
        data: { _id: 'booking123', booking_status: 'Confirmed' },
        timestamp: expect.any(String)
      });
    });

    it('F2P: should return 404 when booking not found', async () => {
      mockRequest.params = { id: 'invalid123' };
      mockRequest.body = { bookingStatus: 'Confirmed' };
      
      mockBookingService.getInstance.mockReturnValue({
        updateBooking: jest.fn().mockResolvedValue({
          success: false,
          message: 'Booking not found',
          error: 'BOOKING_NOT_FOUND'
        })
      } as any);

      await bookingController.updateBooking(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Booking not found',
        error: 'BOOKING_NOT_FOUND',
        timestamp: expect.any(String)
      });
    });

    it('F2P: should return 400 for invalid status transition', async () => {
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = { bookingStatus: 'Invalid' };
      
      mockBookingService.getInstance.mockReturnValue({
        updateBooking: jest.fn().mockResolvedValue({
          success: false,
          message: 'Invalid status transition',
          error: 'INVALID_STATUS_TRANSITION'
        })
      } as any);

      await bookingController.updateBooking(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid status transition',
        error: 'INVALID_STATUS_TRANSITION',
        timestamp: expect.any(String)
      });
    });
  });

  describe('getBookingById - F2P Tests', () => {
    it('F2P: should retrieve booking successfully', async () => {
      mockRequest.params = { id: 'booking123' };
      
      mockBookingService.getInstance.mockReturnValue({
        getBookingById: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking retrieved successfully',
          data: { _id: 'booking123', user_id: 'user123' }
        })
      } as any);

      await bookingController.getBookingById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Booking retrieved successfully',
        data: { _id: 'booking123', user_id: 'user123' },
        timestamp: expect.any(String)
      });
    });

    it('F2P: should return 404 for non-existent booking', async () => {
      mockRequest.params = { id: 'invalid123' };
      
      mockBookingService.getInstance.mockReturnValue({
        getBookingById: jest.fn().mockResolvedValue({
          success: false,
          message: 'Booking not found',
          error: 'BOOKING_NOT_FOUND'
        })
      } as any);

      await bookingController.getBookingById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Booking not found',
        error: 'BOOKING_NOT_FOUND',
        timestamp: expect.any(String)
      });
    });
  });

  describe('getBookings - F2P Tests', () => {
    it('F2P: should retrieve bookings with filters', async () => {
      mockRequest.query = {
        userId: 'user123',
        bookingStatus: ['Confirmed', 'Completed'],
        page: '1',
        limit: '20'
      };
      
      mockBookingService.getInstance.mockReturnValue({
        getBookings: jest.fn().mockResolvedValue({
          success: true,
          message: 'Bookings retrieved successfully',
          data: {
            bookings: [{ _id: 'booking1' }, { _id: 'booking2' }],
            total: 2,
            page: 1,
            totalPages: 1
          }
        })
      } as any);

      await bookingController.getBookings(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Bookings retrieved successfully',
        data: {
          bookings: [{ _id: 'booking1' }, { _id: 'booking2' }],
          total: 2,
          page: 1,
          totalPages: 1
        },
        timestamp: expect.any(String)
      });
    });

    it('F2P: should handle default pagination values', async () => {
      mockRequest.query = {};
      
      mockBookingService.getInstance.mockReturnValue({
        getBookings: jest.fn().mockResolvedValue({
          success: true,
          message: 'Bookings retrieved successfully',
          data: { bookings: [], total: 0, page: 1, totalPages: 0 }
        })
      } as any);

      await bookingController.getBookings(mockRequest as Request, mockResponse as Response);

      expect(mockBookingService.getInstance().getBookings).toHaveBeenCalledWith(
        {}, 1, 20
      );
    });

    it('F2P: should parse date filters correctly', async () => {
      mockRequest.query = {
        dateFrom: '2023-01-01',
        dateTo: '2023-12-31'
      };
      
      mockBookingService.getInstance.mockReturnValue({
        getBookings: jest.fn().mockResolvedValue({
          success: true,
          message: 'Bookings retrieved successfully',
          data: { bookings: [], total: 0, page: 1, totalPages: 0 }
        })
      } as any);

      await bookingController.getBookings(mockRequest as Request, mockResponse as Response);

      expect(mockBookingService.getInstance().getBookings).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom: expect.any(Date),
          dateTo: expect.any(Date)
        }), 1, 20
      );
    });
  });

  describe('getBookingStats - F2P Tests', () => {
    it('F2P: should retrieve booking statistics', async () => {
      mockRequest.query = {
        userId: 'user123',
        dateFrom: '2023-01-01'
      };
      
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

      await bookingController.getBookingStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
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
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('cancelBooking - F2P Tests', () => {
    it('F2P: should cancel booking successfully', async () => {
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = { reason: 'Customer request' };
      
      mockBookingService.getInstance.mockReturnValue({
        cancelBooking: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking cancelled successfully',
          data: { _id: 'booking123', booking_status: 'CancelledByUser' }
        })
      } as any);

      await bookingController.cancelBooking(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Booking cancelled successfully',
        data: { _id: 'booking123', booking_status: 'CancelledByUser' },
        timestamp: expect.any(String)
      });
    });

    it('F2P: should cancel booking without reason', async () => {
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = {};
      
      mockBookingService.getInstance.mockReturnValue({
        cancelBooking: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking cancelled successfully',
          data: { _id: 'booking123', booking_status: 'CancelledByUser' }
        })
      } as any);

      await bookingController.cancelBooking(mockRequest as Request, mockResponse as Response);

      expect(mockBookingService.getInstance().cancelBooking).toHaveBeenCalledWith(
        'booking123', undefined
      );
    });
  });

  describe('confirmBooking - F2P Tests', () => {
    it('F2P: should confirm booking successfully', async () => {
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = { driverId: 'driver123' };
      
      mockBookingService.getInstance.mockReturnValue({
        confirmBooking: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking confirmed successfully',
          data: { _id: 'booking123', booking_status: 'Confirmed', driver_id: 'driver123' }
        })
      } as any);

      await bookingController.confirmBooking(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Booking confirmed successfully',
        data: { _id: 'booking123', booking_status: 'Confirmed', driver_id: 'driver123' },
        timestamp: expect.any(String)
      });
    });
  });

  describe('startTrip - F2P Tests', () => {
    it('F2P: should start trip successfully', async () => {
      mockRequest.params = { id: 'booking123' };
      
      mockBookingService.getInstance.mockReturnValue({
        startTrip: jest.fn().mockResolvedValue({
          success: true,
          message: 'Trip started successfully',
          data: { _id: 'booking123', booking_status: 'On Ride' }
        })
      } as any);

      await bookingController.startTrip(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Trip started successfully',
        data: { _id: 'booking123', booking_status: 'On Ride' },
        timestamp: expect.any(String)
      });
    });
  });

  describe('completeTrip - F2P Tests', () => {
    it('F2P: should complete trip successfully', async () => {
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = { waitingCharges: 10, otherCharges: 5 };
      
      mockBookingService.getInstance.mockReturnValue({
        completeTrip: jest.fn().mockResolvedValue({
          success: true,
          message: 'Trip completed successfully',
          data: { _id: 'booking123', booking_status: 'Completed', total_cost: 65 }
        })
      } as any);

      await bookingController.completeTrip(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Trip completed successfully',
        data: { _id: 'booking123', booking_status: 'Completed', total_cost: 65 },
        timestamp: expect.any(String)
      });
    });
  });

  describe('getUserBookingHistory - F2P Tests', () => {
    it('F2P: should get user booking history', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.query = { page: '1', limit: '10' };
      
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

      await bookingController.getUserBookingHistory(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockBookingService.getInstance().getUserBookingHistory).toHaveBeenCalledWith(
        'user123', 1, 10
      );
    });

    it('F2P: should use default pagination values', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.query = {};
      
      mockBookingService.getInstance.mockReturnValue({
        getUserBookingHistory: jest.fn().mockResolvedValue({
          success: true,
          message: 'User booking history retrieved successfully',
          data: { bookings: [], total: 0, page: 1, totalPages: 0 }
        })
      } as any);

      await bookingController.getUserBookingHistory(mockRequest as Request, mockResponse as Response);

      expect(mockBookingService.getInstance().getUserBookingHistory).toHaveBeenCalledWith(
        'user123', 1, 20
      );
    });
  });

  describe('getDriverBookingHistory - F2P Tests', () => {
    it('F2P: should get driver booking history', async () => {
      mockRequest.params = { driverId: 'driver123' };
      mockRequest.query = { page: '2', limit: '15' };
      
      mockBookingService.getInstance.mockReturnValue({
        getDriverBookingHistory: jest.fn().mockResolvedValue({
          success: true,
          message: 'Driver booking history retrieved successfully',
          data: {
            bookings: [{ _id: 'booking3' }, { _id: 'booking4' }],
            total: 2,
            page: 2,
            totalPages: 1
          }
        })
      } as any);

      await bookingController.getDriverBookingHistory(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockBookingService.getInstance().getDriverBookingHistory).toHaveBeenCalledWith(
        'driver123', 2, 15
      );
    });
  });

  describe('Error Handling - F2P Tests', () => {
    it('F2P: should handle service errors consistently', async () => {
      mockRequest.params = { id: 'booking123' };
      
      mockBookingService.getInstance.mockReturnValue({
        getBookingById: jest.fn().mockRejectedValue(new Error('Service unavailable'))
      } as any);

      await bookingController.getBookingById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        timestamp: expect.any(String)
      });
    });

    it('F2P: should include timestamp in all responses', async () => {
      mockRequest.params = { id: 'booking123' };
      
      mockBookingService.getInstance.mockReturnValue({
        getBookingById: jest.fn().mockResolvedValue({
          success: true,
          message: 'Booking retrieved successfully',
          data: { _id: 'booking123' }
        })
      } as any);

      await bookingController.getBookingById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String)
        })
      );
    });
  });
});
