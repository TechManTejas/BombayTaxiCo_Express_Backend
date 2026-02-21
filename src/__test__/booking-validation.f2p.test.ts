/**
 * F2P Tests for Booking Validation
 * Tests that fail on base branch and pass after implementation
 */

import BookingValidator from '../utils/booking-validation';
import { CreateBookingRequest, BookingUpdateRequest } from '../services/booking.service';
import { TripType, BookingStatus } from '../models/booking.model';

describe('BookingValidator - F2P Tests', () => {
  describe('validateCreateBookingRequest - F2P Tests', () => {
    const validBookingRequest: CreateBookingRequest = {
      userId: '507f1f77bcf86cd799439011',
      taxiId: '507f1f77bcf86cd799439012',
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
      address: '123 Main St, City, State',
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
      otherDetails: 'Test booking details'
    };

    it('F2P: should validate a complete valid booking request', () => {
      const result = BookingValidator.validateCreateBookingRequest(validBookingRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('F2P: should fail validation for missing required fields', () => {
      const invalidRequest = { ...validBookingRequest };
      delete (invalidRequest as any).userId;
      delete (invalidRequest as any).taxiId;
      delete (invalidRequest as any).pickupAddress;

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.field === 'userId')).toBe(true);
      expect(result.errors.some(e => e.field === 'taxiId')).toBe(true);
      expect(result.errors.some(e => e.field === 'pickupAddress')).toBe(true);
    });

    it('F2P: should fail validation for invalid email format', () => {
      const invalidRequest = {
        ...validBookingRequest,
        emailId: 'invalid-email'
      };

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'emailId' && e.message.includes('Invalid email format'))).toBe(true);
    });

    it('F2P: should fail validation for invalid phone number', () => {
      const invalidRequest = {
        ...validBookingRequest,
        contactNumber: 'abc123'
      };

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'contactNumber' && e.message.includes('Invalid contact number format'))).toBe(true);
    });

    it('F2P: should fail validation for phone number with insufficient digits', () => {
      const invalidRequest = {
        ...validBookingRequest,
        contactNumber: '123456789' // Only 9 digits
      };

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'contactNumber' && e.message.includes('at least 10 digits'))).toBe(true);
    });

    it('F2P: should fail validation for past pickup date', () => {
      const invalidRequest = {
        ...validBookingRequest,
        pickupDate: new Date(Date.now() - 86400000) // Yesterday
      };

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'pickupDate' && e.message.includes('cannot be in the past'))).toBe(true);
    });

    it('F2P: should fail validation for invalid time format', () => {
      const invalidRequest = {
        ...validBookingRequest,
        pickupTime: '10:00:00' // Invalid format, should be HH:MM
      };

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'pickupTime' && e.message.includes('Invalid time format'))).toBe(true);
    });

    it('F2P: should fail validation for invalid trip type', () => {
      const invalidRequest = {
        ...validBookingRequest,
        tripType: 'Invalid Trip' as any
      };

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'tripType' && e.message.includes('Invalid trip type'))).toBe(true);
    });

    it('F2P: should fail validation for name too short', () => {
      const invalidRequest = {
        ...validBookingRequest,
        name: 'A' // Only 1 character
      };

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'name' && e.message.includes('at least 2 characters'))).toBe(true);
    });

    it('F2P: should fail validation for name too long', () => {
      const invalidRequest = {
        ...validBookingRequest,
        name: 'A'.repeat(101) // 101 characters
      };

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'name' && e.message.includes('must not exceed 100 characters'))).toBe(true);
    });

    it('F2P: should fail validation for invalid passenger count', () => {
      const invalidRequest = {
        ...validBookingRequest,
        numberOfPassengers: '0' // Less than 1
      };

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'numberOfPassengers' && e.message.includes('must be between 1 and 10'))).toBe(true);
    });

    it('F2P: should fail validation for negative base fare', () => {
      const invalidRequest = {
        ...validBookingRequest,
        baseFare: -10
      };

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'baseFare' && e.message.includes('must be a positive number'))).toBe(true);
    });

    it('F2P: should fail validation for negative additional charges', () => {
      const invalidRequest = {
        ...validBookingRequest,
        additionalCharges: -5
      };

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'additionalCharges' && e.message.includes('cannot be negative'))).toBe(true);
    });

    it('F2P: should fail validation for invalid gender', () => {
      const invalidRequest = {
        ...validBookingRequest,
        gender: 'Invalid'
      };

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'gender' && e.message.includes('Invalid gender value'))).toBe(true);
    });

    it('F2P: should fail validation for address too short', () => {
      const invalidRequest = {
        ...validBookingRequest,
        address: '123' // Less than 10 characters
      };

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'address' && e.message.includes('must be at least 10 characters'))).toBe(true);
    });

    it('F2P: should fail validation for additional request too long', () => {
      const invalidRequest = {
        ...validBookingRequest,
        additionalRequest: 'A'.repeat(501) // 501 characters
      };

      const result = BookingValidator.validateCreateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'additionalRequest' && e.message.includes('must not exceed 500 characters'))).toBe(true);
    });

    it('F2P: should pass validation with valid WhatsApp number', () => {
      const validRequest = {
        ...validBookingRequest,
        whatsAppNumber: '+1 (555) 123-4567'
      };

      const result = BookingValidator.validateCreateBookingRequest(validRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('F2P: should pass validation with optional fields omitted', () => {
      const minimalRequest = {
        ...validBookingRequest,
        additionalCharges: undefined,
        discountAmount: undefined,
        additionalRequest: undefined,
        otherDetails: undefined
      };

      const result = BookingValidator.validateCreateBookingRequest(minimalRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateUpdateBookingRequest - F2P Tests', () => {
    const validUpdateRequest: BookingUpdateRequest = {
      bookingStatus: BookingStatus.Confirmed,
      driverId: '507f1f77bcf86cd799439013',
      additionalCharges: 10,
      waitingCharges: 5,
      otherCharges: 3
    };

    it('F2P: should validate a complete valid update request', () => {
      const result = BookingValidator.validateUpdateBookingRequest(validUpdateRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('F2P: should fail validation for invalid booking status', () => {
      const invalidRequest = {
        ...validUpdateRequest,
        bookingStatus: 'InvalidStatus' as any
      };

      const result = BookingValidator.validateUpdateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'bookingStatus' && e.message.includes('Invalid booking status'))).toBe(true);
    });

    it('F2P: should fail validation for negative charges', () => {
      const invalidRequest = {
        ...validUpdateRequest,
        additionalCharges: -5,
        waitingCharges: -2,
        otherCharges: -1
      };

      const result = BookingValidator.validateUpdateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'additionalCharges')).toBe(true);
      expect(result.errors.some(e => e.field === 'waitingCharges')).toBe(true);
      expect(result.errors.some(e => e.field === 'otherCharges')).toBe(true);
    });

    it('F2P: should fail validation for invalid time sequence', () => {
      const invalidRequest = {
        ...validUpdateRequest,
        actualPickupTime: new Date('2023-01-01T10:00:00Z'),
        actualDropoffTime: new Date('2023-01-01T09:00:00Z') // Before pickup time
      };

      const result = BookingValidator.validateUpdateBookingRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'actualDropoffTime' && e.message.includes('must be after actual pickup time'))).toBe(true);
    });

    it('F2P: should pass validation with valid time sequence', () => {
      const validRequest = {
        ...validUpdateRequest,
        actualPickupTime: new Date('2023-01-01T10:00:00Z'),
        actualDropoffTime: new Date('2023-01-01T11:00:00Z') // After pickup time
      };

      const result = BookingValidator.validateUpdateBookingRequest(validRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('F2P: should pass validation with empty update request', () => {
      const emptyRequest = {};

      const result = BookingValidator.validateUpdateBookingRequest(emptyRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateBookingFilters - F2P Tests', () => {
    const validFilters = {
      userId: '507f1f77bcf86cd799439011',
      bookingStatus: [BookingStatus.Confirmed, BookingStatus.Completed],
      dateFrom: '2023-01-01',
      dateTo: '2023-12-31',
      minAmount: 10,
      maxAmount: 100,
      page: 1,
      limit: 20
    };

    it('F2P: should validate complete valid filters', () => {
      const result = BookingValidator.validateBookingFilters(validFilters);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('F2P: should fail validation for invalid date range', () => {
      const invalidFilters = {
        ...validFilters,
        dateFrom: '2023-12-31',
        dateTo: '2023-01-01' // Before dateFrom
      };

      const result = BookingValidator.validateBookingFilters(invalidFilters);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'dateRange' && e.message.includes('Date from must be before date to'))).toBe(true);
    });

    it('F2P: should fail validation for invalid amount range', () => {
      const invalidFilters = {
        ...validFilters,
        minAmount: 100,
        maxAmount: 10 // Less than minAmount
      };

      const result = BookingValidator.validateBookingFilters(invalidFilters);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'amountRange' && e.message.includes('Minimum amount cannot be greater than maximum amount'))).toBe(true);
    });

    it('F2P: should fail validation for invalid booking status', () => {
      const invalidFilters = {
        ...validFilters,
        bookingStatus: [BookingStatus.Confirmed, 'InvalidStatus' as any]
      };

      const result = BookingValidator.validateBookingFilters(invalidFilters);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'bookingStatus' && e.message.includes('Invalid booking statuses'))).toBe(true);
    });

    it('F2P: should fail validation for invalid page number', () => {
      const invalidFilters = {
        ...validFilters,
        page: 0
      };

      const result = BookingValidator.validateBookingFilters(invalidFilters);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'page' && e.message.includes('must be a positive integer'))).toBe(true);
    });

    it('F2P: should fail validation for invalid limit', () => {
      const invalidFilters = {
        ...validFilters,
        limit: 101 // Over maximum
      };

      const result = BookingValidator.validateBookingFilters(invalidFilters);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'limit' && e.message.includes('must be between 1 and 100'))).toBe(true);
    });

    it('F2P: should pass validation with minimal filters', () => {
      const minimalFilters = {
        page: 1
      };

      const result = BookingValidator.validateBookingFilters(minimalFilters);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateStatusTransition - F2P Tests', () => {
    it('F2P: should allow valid status transition from New to Confirmed', () => {
      const result = BookingValidator.validateStatusTransition(BookingStatus.New, BookingStatus.Confirmed);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('F2P: should allow valid status transition from Confirmed to OnRide', () => {
      const result = BookingValidator.validateStatusTransition(BookingStatus.Confirmed, BookingStatus.OnRide);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('F2P: should allow valid status transition from OnRide to Completed', () => {
      const result = BookingValidator.validateStatusTransition(BookingStatus.OnRide, BookingStatus.Completed);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('F2P: should fail invalid status transition from Completed to New', () => {
      const result = BookingValidator.validateStatusTransition(BookingStatus.Completed, BookingStatus.New);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'statusTransition' && e.message.includes('Invalid status transition'))).toBe(true);
    });

    it('F2P: should fail invalid status transition from Cancelled to Confirmed', () => {
      const result = BookingValidator.validateStatusTransition(BookingStatus.Cancelled, BookingStatus.Confirmed);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'statusTransition' && e.message.includes('Invalid status transition'))).toBe(true);
    });

    it('F2P: should allow cancellation from any active state', () => {
      const cancelTransitions = [
        { from: BookingStatus.New, to: BookingStatus.Cancelled },
        { from: BookingStatus.Confirmed, to: BookingStatus.Cancelled },
        { from: BookingStatus.OnRide, to: BookingStatus.Cancelled }
      ];

      cancelTransitions.forEach(({ from, to }) => {
        const result = BookingValidator.validateStatusTransition(from, to);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('validateBookingId - F2P Tests', () => {
    it('F2P: should validate correct MongoDB ObjectId format', () => {
      const validId = '507f1f77bcf86cd799439011';
      const result = BookingValidator.validateBookingId(validId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('F2P: should fail validation for empty booking ID', () => {
      const result = BookingValidator.validateBookingId('');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'bookingId' && e.message.includes('is required'))).toBe(true);
    });

    it('F2P: should fail validation for invalid ObjectId format', () => {
      const invalidId = 'invalid-id-format';
      const result = BookingValidator.validateBookingId(invalidId);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'bookingId' && e.message.includes('Invalid booking ID format'))).toBe(true);
    });

    it('F2P: should fail validation for ObjectId with incorrect length', () => {
      const invalidId = '507f1f77bcf86cd7994390'; // Too short
      const result = BookingValidator.validateBookingId(invalidId);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'bookingId' && e.message.includes('Invalid booking ID format'))).toBe(true);
    });
  });

  describe('validateUserId - F2P Tests', () => {
    it('F2P: should validate correct user ID format', () => {
      const validId = '507f1f77bcf86cd799439011';
      const result = BookingValidator.validateUserId(validId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('F2P: should fail validation for empty user ID', () => {
      const result = BookingValidator.validateUserId('');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'userId' && e.message.includes('is required'))).toBe(true);
    });

    it('F2P: should fail validation for invalid user ID format', () => {
      const invalidId = 'user123';
      const result = BookingValidator.validateUserId(invalidId);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'userId' && e.message.includes('Invalid user ID format'))).toBe(true);
    });
  });

  describe('validateDriverId - F2P Tests', () => {
    it('F2P: should validate correct driver ID format', () => {
      const validId = '507f1f77bcf86cd799439011';
      const result = BookingValidator.validateDriverId(validId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('F2P: should fail validation for empty driver ID', () => {
      const result = BookingValidator.validateDriverId('');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'driverId' && e.message.includes('is required'))).toBe(true);
    });

    it('F2P: should fail validation for invalid driver ID format', () => {
      const invalidId = 'driver123';
      const result = BookingValidator.validateDriverId(invalidId);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'driverId' && e.message.includes('Invalid driver ID format'))).toBe(true);
    });
  });

  describe('validateTaxiId - F2P Tests', () => {
    it('F2P: should validate correct taxi ID format', () => {
      const validId = '507f1f77bcf86cd799439011';
      const result = BookingValidator.validateTaxiId(validId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('F2P: should fail validation for empty taxi ID', () => {
      const result = BookingValidator.validateTaxiId('');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'taxiId' && e.message.includes('is required'))).toBe(true);
    });

    it('F2P: should fail validation for invalid taxi ID format', () => {
      const invalidId = 'taxi123';
      const result = BookingValidator.validateTaxiId(invalidId);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'taxiId' && e.message.includes('Invalid taxi ID format'))).toBe(true);
    });
  });

  describe('formatValidationErrors - F2P Tests', () => {
    it('F2P: should format multiple validation errors correctly', () => {
      const errors = [
        { field: 'emailId', message: 'Invalid email format' },
        { field: 'contactNumber', message: 'Invalid contact number format' },
        { field: 'pickupDate', message: 'Pickup date cannot be in the past' }
      ];

      const formatted = BookingValidator.formatValidationErrors(errors);

      expect(formatted).toBe('emailId: Invalid email format; contactNumber: Invalid contact number format; pickupDate: Pickup date cannot be in the past');
    });

    it('F2P: should return empty string for no errors', () => {
      const formatted = BookingValidator.formatValidationErrors([]);

      expect(formatted).toBe('');
    });

    it('F2P: should format single validation error', () => {
      const errors = [
        { field: 'emailId', message: 'Invalid email format' }
      ];

      const formatted = BookingValidator.formatValidationErrors(errors);

      expect(formatted).toBe('emailId: Invalid email format');
    });
  });
});
