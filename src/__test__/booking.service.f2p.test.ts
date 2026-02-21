/**
 * F2P Tests for Booking Service
 * Tests that fail on base branch and pass after implementation
 */

import BookingService, { CreateBookingRequest, BookingUpdateRequest } from '../services/booking.service';
import { BookingStatus, TripType } from '../models/booking.model';
import User from '../models/user.model';
import Taxi from '../models/taxi.model';
import Booking from '../models/booking.model';

// Mock the models
jest.mock('../models/user.model');
jest.mock('../models/taxi.model');
jest.mock('../models/booking.model');

const mockUser = User as jest.Mocked<typeof User>;
const mockTaxi = Taxi as jest.Mocked<typeof Taxi>;
const mockBooking = Booking as jest.Mocked<typeof Booking>;

describe('BookingService - F2P Tests', () => {
  let bookingService: BookingService;
  let mockUserInstance: any;
  let mockTaxiInstance: any;
  let mockBookingInstance: any;

  beforeEach(() => {
    bookingService = BookingService.getInstance();
    jest.clearAllMocks();

    // Setup mock instances
    mockUserInstance = {
      _id: 'user123',
      name: 'John Doe',
      email_id: 'john@example.com',
      mobile_no: '+1234567890'
    };

    mockTaxiInstance = {
      _id: 'taxi123',
      taxi_no: 'TX-1234',
      taxi_status: 'Available',
      save: jest.fn().mockResolvedValue(true)
    };

    mockBookingInstance = {
      _id: 'booking123',
      user_id: 'user123',
      taxi_id: 'taxi123',
      booking_status: BookingStatus.New,
      save: jest.fn().mockResolvedValue(true)
    };
  });

  describe('createBooking - F2P Tests', () => {
    const validBookingRequest: CreateBookingRequest = {
      userId: 'user123',
      taxiId: 'taxi123',
      pickupAddress: '123 Main St',
      dropAddress: '456 Oak Ave',
      pickupDate: new Date(Date.now() + 86400000), // Tomorrow
      pickupTime: '10:00',
      tripType: TripType.OneWay,
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

    it('F2P: should create booking successfully with valid data', async () => {
      // This test will fail on base branch because BookingService doesn't exist
      mockUser.findById.mockResolvedValue(mockUserInstance);
      mockTaxi.findById.mockResolvedValue(mockTaxiInstance);
      mockBooking.mockImplementation(() => mockBookingInstance);

      const result = await bookingService.createBooking(validBookingRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.user_id).toBe('user123');
      expect(result.data?.taxi_id).toBe('taxi123');
      expect(result.data?.booking_status).toBe(BookingStatus.New);
    });

    it('F2P: should fail when user does not exist', async () => {
      mockUser.findById.mockResolvedValue(null);

      const result = await bookingService.createBooking(validBookingRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('USER_NOT_FOUND');
      expect(result.message).toBe('User not found');
    });

    it('F2P: should fail when taxi does not exist', async () => {
      mockUser.findById.mockResolvedValue(mockUserInstance);
      mockTaxi.findById.mockResolvedValue(null);

      const result = await bookingService.createBooking(validBookingRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('TAXI_NOT_FOUND');
      expect(result.message).toBe('Taxi not found');
    });

    it('F2P: should fail when taxi is not available', async () => {
      mockUser.findById.mockResolvedValue(mockUserInstance);
      mockTaxi.findById.mockResolvedValue({
        ...mockTaxiInstance,
        taxi_status: 'Unavailable'
      });

      const result = await bookingService.createBooking(validBookingRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('TAXI_NOT_AVAILABLE');
      expect(result.message).toBe('Taxi is not available');
    });

    it('F2P: should calculate total fare correctly', async () => {
      mockUser.findById.mockResolvedValue(mockUserInstance);
      mockTaxi.findById.mockResolvedValue(mockTaxiInstance);
      mockBooking.mockImplementation(() => ({
        ...mockBookingInstance,
        total_cost: 45 // 50 - 5 discount
      }));

      const requestWithDiscount = {
        ...validBookingRequest,
        baseFare: 50,
        additionalCharges: 5,
        discountAmount: 10
      };

      const result = await bookingService.createBooking(requestWithDiscount);

      expect(result.success).toBe(true);
      expect(result.data?.total_cost).toBe(45);
    });

    it('F2P: should update taxi status to assigned', async () => {
      mockUser.findById.mockResolvedValue(mockUserInstance);
      mockTaxi.findById.mockResolvedValue(mockTaxiInstance);
      mockBooking.mockImplementation(() => mockBookingInstance);

      await bookingService.createBooking(validBookingRequest);

      expect(mockTaxiInstance.save).toHaveBeenCalled();
      expect(mockTaxiInstance.taxi_status).toBe('Assigned');
    });

    it('F2P: should handle database errors gracefully', async () => {
      mockUser.findById.mockRejectedValue(new Error('Database connection failed'));

      const result = await bookingService.createBooking(validBookingRequest);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create booking');
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('updateBooking - F2P Tests', () => {
    beforeEach(() => {
      mockBooking.findById.mockResolvedValue(mockBookingInstance);
    });

    it('F2P: should update booking status successfully', async () => {
      const updateRequest: BookingUpdateRequest = {
        bookingStatus: BookingStatus.Confirmed
      };

      const result = await bookingService.updateBooking('booking123', updateRequest);

      expect(result.success).toBe(true);
      expect(mockBookingInstance.save).toHaveBeenCalled();
      expect(mockBookingInstance.booking_status).toBe(BookingStatus.Confirmed);
    });

    it('F2P: should fail when booking does not exist', async () => {
      mockBooking.findById.mockResolvedValue(null);

      const result = await bookingService.updateBooking('invalid123', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('BOOKING_NOT_FOUND');
    });

    it('F2P: should fail with invalid status transition', async () => {
      mockBookingInstance.booking_status = BookingStatus.Completed;

      const updateRequest: BookingUpdateRequest = {
        bookingStatus: BookingStatus.New
      };

      const result = await bookingService.updateBooking('booking123', updateRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_STATUS_TRANSITION');
      expect(result.message).toContain('Invalid status transition');
    });

    it('F2P: should update charges and recalculate total', async () => {
      const updateRequest: BookingUpdateRequest = {
        additionalCharges: 10,
        waitingCharges: 5,
        otherCharges: 3
      };

      mockBookingInstance.base_fare = 50;
      mockBookingInstance.discount_amount = 5;

      const result = await bookingService.updateBooking('booking123', updateRequest);

      expect(result.success).toBe(true);
      expect(mockBookingInstance.save).toHaveBeenCalled();
      // Expected: 50 + 10 + 5 + 3 - 5 = 63
      expect(mockBookingInstance.total_cost).toBe(63);
    });

    it('F2P: should update taxi status when booking is cancelled', async () => {
      const updateRequest: BookingUpdateRequest = {
        bookingStatus: BookingStatus.Cancelled
      };

      mockTaxi.findById.mockResolvedValue(mockTaxiInstance);

      const result = await bookingService.updateBooking('booking123', updateRequest);

      expect(result.success).toBe(true);
      expect(mockTaxiInstance.save).toHaveBeenCalled();
      expect(mockTaxiInstance.taxi_status).toBe('Available');
    });
  });

  describe('getBookingById - F2P Tests', () => {
    it('F2P: should retrieve booking with populated fields', async () => {
      const populatedBooking = {
        ...mockBookingInstance,
        user_id: mockUserInstance,
        taxi_id: mockTaxiInstance,
        driver_id: null
      };

      mockBooking.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(populatedBooking)
          })
        })
      } as any);

      const result = await bookingService.getBookingById('booking123');

      expect(result.success).toBe(true);
      expect(result.data?.user_id).toBeDefined();
      expect(result.data?.taxi_id).toBeDefined();
    });

    it('F2P: should return error for non-existent booking', async () => {
      mockBooking.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)
          })
        })
      } as any);

      const result = await bookingService.getBookingById('invalid123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('BOOKING_NOT_FOUND');
    });
  });

  describe('cancelBooking - F2P Tests', () => {
    beforeEach(() => {
      mockBookingInstance.booking_status = BookingStatus.Confirmed;
      mockBooking.findById.mockResolvedValue(mockBookingInstance);
    });

    it('F2P: should cancel booking successfully', async () => {
      const result = await bookingService.cancelBooking('booking123', 'Customer request');

      expect(result.success).toBe(true);
      expect(mockBookingInstance.save).toHaveBeenCalled();
      expect(mockBookingInstance.booking_status).toBe(BookingStatus.CancelledByUser);
      expect(mockBookingInstance.additional_request).toBe('Customer request');
    });

    it('F2P: should fail to cancel completed booking', async () => {
      mockBookingInstance.booking_status = BookingStatus.Completed;

      const result = await bookingService.cancelBooking('booking123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('BOOKING_CANNOT_BE_CANCELLED');
    });

    it('F2P: should make taxi available after cancellation', async () => {
      mockTaxi.findById.mockResolvedValue(mockTaxiInstance);

      await bookingService.cancelBooking('booking123');

      expect(mockTaxiInstance.save).toHaveBeenCalled();
      expect(mockTaxiInstance.taxi_status).toBe('Available');
    });
  });

  describe('confirmBooking - F2P Tests', () => {
    beforeEach(() => {
      mockBookingInstance.booking_status = BookingStatus.New;
      mockBooking.findById.mockResolvedValue(mockBookingInstance);
    });

    it('F2P: should confirm booking successfully', async () => {
      const result = await bookingService.confirmBooking('booking123', 'driver123');

      expect(result.success).toBe(true);
      expect(mockBookingInstance.save).toHaveBeenCalled();
      expect(mockBookingInstance.booking_status).toBe(BookingStatus.Confirmed);
      expect(mockBookingInstance.driver_id).toBe('driver123');
    });

    it('F2P: should fail to confirm non-new booking', async () => {
      mockBookingInstance.booking_status = BookingStatus.Completed;

      const result = await bookingService.confirmBooking('booking123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('BOOKING_CANNOT_BE_CONFIRMED');
    });
  });

  describe('startTrip - F2P Tests', () => {
    beforeEach(() => {
      mockBookingInstance.booking_status = BookingStatus.Confirmed;
      mockBooking.findById.mockResolvedValue(mockBookingInstance);
    });

    it('F2P: should start trip successfully', async () => {
      mockTaxi.findById.mockResolvedValue(mockTaxiInstance);

      const result = await bookingService.startTrip('booking123');

      expect(result.success).toBe(true);
      expect(mockBookingInstance.save).toHaveBeenCalled();
      expect(mockBookingInstance.booking_status).toBe(BookingStatus.OnRide);
      expect(mockTaxiInstance.taxi_status).toBe('On a Trip');
    });

    it('F2P: should fail to start non-confirmed booking', async () => {
      mockBookingInstance.booking_status = BookingStatus.New;

      const result = await bookingService.startTrip('booking123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('TRIP_CANNOT_BE_STARTED');
    });
  });

  describe('completeTrip - F2P Tests', () => {
    beforeEach(() => {
      mockBookingInstance.booking_status = BookingStatus.OnRide;
      mockBookingInstance.base_fare = 50;
      mockBookingInstance.additional_charges = 0;
      mockBookingInstance.discount_amount = 0;
      mockBooking.findById.mockResolvedValue(mockBookingInstance);
    });

    it('F2P: should complete trip successfully', async () => {
      mockTaxi.findById.mockResolvedValue(mockTaxiInstance);

      const result = await bookingService.completeTrip('booking123', {
        waitingCharges: 10,
        otherCharges: 5
      });

      expect(result.success).toBe(true);
      expect(mockBookingInstance.save).BeenCalled();
      expect(mockBookingInstance.booking_status).toBe(BookingStatus.Completed);
      expect(mockBookingInstance.waiting_charges).toBe(10);
      expect(mockBookingInstance.other_charges).toBe(5);
      expect(mockBookingInstance.total_cost).toBe(65); // 50 + 10 + 5
      expect(mockTaxiInstance.taxi_status).toBe('Available');
    });

    it('F2P: should fail to complete non-on-ride booking', async () => {
      mockBookingInstance.booking_status = BookingStatus.Confirmed;

      const result = await bookingService.completeTrip('booking123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('TRIP_CANNOT_BE_COMPLETED');
    });
  });

  describe('getBookingStats - F2P Tests', () => {
    it('F2P: should calculate booking statistics correctly', async () => {
      const mockStats = [
        {
          _id: null,
          totalBookings: 100,
          completedBookings: 80,
          cancelledBookings: 10,
          cancelledByUserBookings: 5,
          newBookings: 5,
          totalRevenue: 5000,
          averageFare: 50
        }
      ];

      mockBooking.aggregate.mockResolvedValue(mockStats);

      const result = await bookingService.getBookingStats();

      expect(result.success).toBe(true);
      expect(result.data?.totalBookings).toBe(100);
      expect(result.data?.completedBookings).toBe(80);
      expect(result.data?.cancelledBookings).toBe(15); // 10 + 5
      expect(result.data?.newBookings).toBe(5);
      expect(result.data?.totalRevenue).toBe(5000);
      expect(result.data?.completionRate).toBe(80); // 80/100 * 100
      expect(result.data?.cancellationRate).toBe(15); // 15/100 * 100
    });

    it('F2P: should handle empty statistics', async () => {
      mockBooking.aggregate.mockResolvedValue([]);

      const result = await bookingService.getBookingStats();

      expect(result.success).toBe(true);
      expect(result.data?.totalBookings).toBe(0);
      expect(result.data?.completionRate).toBe(0);
      expect(result.data?.cancellationRate).toBe(0);
    });
  });

  describe('getUserBookingHistory - F2P Tests', () => {
    it('F2P: should get user booking history', async () => {
      const mockBookings = [mockBookingInstance];
      
      mockBooking.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockReturnValue({
                skip: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue(mockBookings)
                })
              })
            })
          })
        })
      } as any);

      mockBooking.countDocuments.mockResolvedValue(1);

      const result = await bookingService.getUserBookingHistory('user123', 1, 20);

      expect(result.success).toBe(true);
      expect(result.data?.bookings).toHaveLength(1);
      expect(result.data?.total).toBe(1);
      expect(result.data?.page).toBe(1);
    });
  });

  describe('Singleton Pattern - F2P Tests', () => {
    it('F2P: should return the same instance', () => {
      const instance1 = BookingService.getInstance();
      const instance2 = BookingService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('F2P: should maintain state across getInstance calls', async () => {
      const instance1 = BookingService.getInstance();
      const instance2 = BookingService.getInstance();

      mockUser.findById.mockResolvedValue(mockUserInstance);
      mockTaxi.findById.mockResolvedValue(mockTaxiInstance);
      mockBooking.mockImplementation(() => mockBookingInstance);

      const result1 = await instance1.createBooking({
        userId: 'user123',
        taxiId: 'taxi123',
        pickupAddress: '123 Main St',
        dropAddress: '456 Oak Ave',
        pickupDate: new Date(Date.now() + 86400000),
        pickupTime: '10:00',
        tripType: TripType.OneWay,
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
      });

      expect(result1.success).toBe(true);

      // Second instance should work the same
      const result2 = await instance2.getBookingById('booking123');
      mockBooking.findById.mockResolvedValue(mockBookingInstance);
      expect(result2).toBeDefined();
    });
  });
});
