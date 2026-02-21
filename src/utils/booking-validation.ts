/**
 * Booking Validation Utilities
 * Comprehensive validation for booking requests and data
 */

import { CreateBookingRequest, BookingUpdateRequest } from '../services/booking.service';
import { TripType, BookingStatus } from '../models/booking.model';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class BookingValidator {
  /**
   * Validate create booking request
   */
  static validateCreateBookingRequest(request: CreateBookingRequest): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields validation
    if (!request.userId || request.userId.trim() === '') {
      errors.push({ field: 'userId', message: 'User ID is required' });
    }

    if (!request.taxiId || request.taxiId.trim() === '') {
      errors.push({ field: 'taxiId', message: 'Taxi ID is required' });
    }

    if (!request.pickupAddress || request.pickupAddress.trim() === '') {
      errors.push({ field: 'pickupAddress', message: 'Pickup address is required' });
    }

    if (!request.dropAddress || request.dropAddress.trim() === '') {
      errors.push({ field: 'dropAddress', message: 'Drop address is required' });
    }

    if (!request.pickupDate) {
      errors.push({ field: 'pickupDate', message: 'Pickup date is required' });
    } else {
      const pickupDate = new Date(request.pickupDate);
      if (isNaN(pickupDate.getTime())) {
        errors.push({ field: 'pickupDate', message: 'Invalid pickup date format' });
      } else if (pickupDate < new Date()) {
        errors.push({ field: 'pickupDate', message: 'Pickup date cannot be in the past' });
      }
    }

    if (!request.pickupTime || request.pickupTime.trim() === '') {
      errors.push({ field: 'pickupTime', message: 'Pickup time is required' });
    } else {
      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(request.pickupTime)) {
        errors.push({ field: 'pickupTime', message: 'Invalid time format. Use HH:MM' });
      }
    }

    if (!request.tripType) {
      errors.push({ field: 'tripType', message: 'Trip type is required' });
    } else if (!Object.values(TripType).includes(request.tripType)) {
      errors.push({ field: 'tripType', message: 'Invalid trip type' });
    }

    // Personal information validation
    if (!request.name || request.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (request.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    } else if (request.name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Name must not exceed 100 characters' });
    }

    if (!request.emailId || request.emailId.trim() === '') {
      errors.push({ field: 'emailId', message: 'Email is required' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.emailId)) {
        errors.push({ field: 'emailId', message: 'Invalid email format' });
      }
    }

    if (!request.contactNumber || request.contactNumber.trim() === '') {
      errors.push({ field: 'contactNumber', message: 'Contact number is required' });
    } else {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(request.contactNumber)) {
        errors.push({ field: 'contactNumber', message: 'Invalid contact number format' });
      } else if (request.contactNumber.replace(/\D/g, '').length < 10) {
        errors.push({ field: 'contactNumber', message: 'Contact number must have at least 10 digits' });
      }
    }

    // WhatsApp number validation (optional but if provided, must be valid)
    if (request.whatsAppNumber && request.whatsAppNumber.trim() !== '') {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(request.whatsAppNumber)) {
        errors.push({ field: 'whatsAppNumber', message: 'Invalid WhatsApp number format' });
      } else if (request.whatsAppNumber.replace(/\D/g, '').length < 10) {
        errors.push({ field: 'whatsAppNumber', message: 'WhatsApp number must have at least 10 digits' });
      }
    }

    // Address validation
    if (!request.address || request.address.trim() === '') {
      errors.push({ field: 'address', message: 'Address is required' });
    } else if (request.address.trim().length < 10) {
      errors.push({ field: 'address', message: 'Address must be at least 10 characters' });
    }

    // Passenger and baggage validation
    if (!request.numberOfPassengers || request.numberOfPassengers.trim() === '') {
      errors.push({ field: 'numberOfPassengers', message: 'Number of passengers is required' });
    } else {
      const passengers = parseInt(request.numberOfPassengers);
      if (isNaN(passengers) || passengers < 1 || passengers > 10) {
        errors.push({ field: 'numberOfPassengers', message: 'Number of passengers must be between 1 and 10' });
      }
    }

    if (request.numberOfSmallBags && request.numberOfSmallBags.trim() !== '') {
      const smallBags = parseInt(request.numberOfSmallBags);
      if (isNaN(smallBags) || smallBags < 0 || smallBags > 20) {
        errors.push({ field: 'numberOfSmallBags', message: 'Number of small bags must be between 0 and 20' });
      }
    }

    if (request.numberOfLargeBags && request.numberOfLargeBags.trim() !== '') {
      const largeBags = parseInt(request.numberOfLargeBags);
      if (isNaN(largeBags) || largeBags < 0 || largeBags > 10) {
        errors.push({ field: 'numberOfLargeBags', message: 'Number of large bags must be between 0 and 10' });
      }
    }

    // Fare validation
    if (!request.baseFare || request.baseFare < 0) {
      errors.push({ field: 'baseFare', message: 'Base fare must be a positive number' });
    }

    if (request.additionalCharges && request.additionalCharges < 0) {
      errors.push({ field: 'additionalCharges', message: 'Additional charges cannot be negative' });
    }

    if (request.discountAmount && request.discountAmount < 0) {
      errors.push({ field: 'discountAmount', message: 'Discount amount cannot be negative' });
    }

    // Gender validation
    if (!request.gender || request.gender.trim() === '') {
      errors.push({ field: 'gender', message: 'Gender is required' });
    } else if (!['Male', 'Female', 'Other'].includes(request.gender)) {
      errors.push({ field: 'gender', message: 'Invalid gender value' });
    }

    // Additional request validation (optional)
    if (request.additionalRequest && request.additionalRequest.length > 500) {
      errors.push({ field: 'additionalRequest', message: 'Additional request must not exceed 500 characters' });
    }

    // Other details validation (optional)
    if (request.otherDetails && request.otherDetails.length > 1000) {
      errors.push({ field: 'otherDetails', message: 'Other details must not exceed 1000 characters' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate update booking request
   */
  static validateUpdateBookingRequest(request: BookingUpdateRequest): ValidationResult {
    const errors: ValidationError[] = [];

    // Status validation
    if (request.bookingStatus && !Object.values(BookingStatus).includes(request.bookingStatus)) {
      errors.push({ field: 'bookingStatus', message: 'Invalid booking status' });
    }

    // Driver ID validation (optional)
    if (request.driverId && request.driverId.trim() === '') {
      errors.push({ field: 'driverId', message: 'Driver ID cannot be empty' });
    }

    // Time validations (optional)
    if (request.actualPickupTime) {
      const pickupTime = new Date(request.actualPickupTime);
      if (isNaN(pickupTime.getTime())) {
        errors.push({ field: 'actualPickupTime', message: 'Invalid actual pickup time format' });
      }
    }

    if (request.actualDropoffTime) {
      const dropoffTime = new Date(request.actualDropoffTime);
      if (isNaN(dropoffTime.getTime())) {
        errors.push({ field: 'actualDropoffTime', message: 'Invalid actual dropoff time format' });
      }
    }

    // Validate time sequence if both times are provided
    if (request.actualPickupTime && request.actualDropoffTime) {
      const pickupTime = new Date(request.actualPickupTime);
      const dropoffTime = new Date(request.actualDropoffTime);
      
      if (dropoffTime <= pickupTime) {
        errors.push({ field: 'actualDropoffTime', message: 'Actual dropoff time must be after actual pickup time' });
      }
    }

    // Charge validations (optional)
    if (request.additionalCharges !== undefined && request.additionalCharges < 0) {
      errors.push({ field: 'additionalCharges', message: 'Additional charges cannot be negative' });
    }

    if (request.waitingCharges !== undefined && request.waitingCharges < 0) {
      errors.push({ field: 'waitingCharges', message: 'Waiting charges cannot be negative' });
    }

    if (request.otherCharges !== undefined && request.otherCharges < 0) {
      errors.push({ field: 'otherCharges', message: 'Other charges cannot be negative' });
    }

    // Additional request validation (optional)
    if (request.additionalRequest && request.additionalRequest.length > 500) {
      errors.push({ field: 'additionalRequest', message: 'Additional request must not exceed 500 characters' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate booking filters
   */
  static validateBookingFilters(filters: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Date range validation
    if (filters.dateFrom && filters.dateTo) {
      const dateFrom = new Date(filters.dateFrom);
      const dateTo = new Date(filters.dateTo);
      
      if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
        errors.push({ field: 'dateRange', message: 'Invalid date format' });
      } else if (dateFrom > dateTo) {
        errors.push({ field: 'dateRange', message: 'Date from must be before date to' });
      }
    }

    // Amount range validation
    if (filters.minAmount !== undefined && filters.maxAmount !== undefined) {
      if (filters.minAmount < 0 || filters.maxAmount < 0) {
        errors.push({ field: 'amountRange', message: 'Amount values cannot be negative' });
      } else if (filters.minAmount > filters.maxAmount) {
        errors.push({ field: 'amountRange', message: 'Minimum amount cannot be greater than maximum amount' });
      }
    }

    // Booking status validation
    if (filters.bookingStatus && Array.isArray(filters.bookingStatus)) {
      const invalidStatuses = filters.bookingStatus.filter((status: string) => 
        !Object.values(BookingStatus).includes(status as BookingStatus)
      );
      
      if (invalidStatuses.length > 0) {
        errors.push({ field: 'bookingStatus', message: `Invalid booking statuses: ${invalidStatuses.join(', ')}` });
      }
    }

    // Pagination validation
    if (filters.page !== undefined && (filters.page < 1 || !Number.isInteger(filters.page))) {
      errors.push({ field: 'page', message: 'Page must be a positive integer' });
    }

    if (filters.limit !== undefined && (filters.limit < 1 || filters.limit > 100 || !Number.isInteger(filters.limit))) {
      errors.push({ field: 'limit', message: 'Limit must be between 1 and 100' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate booking status transition
   */
  static validateStatusTransition(currentStatus: BookingStatus, newStatus: BookingStatus): ValidationResult {
    const errors: ValidationError[] = [];

    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.New]: [BookingStatus.Confirmed, BookingStatus.Cancelled, BookingStatus.CancelledByUser],
      [BookingStatus.Confirmed]: [BookingStatus.OnRide, BookingStatus.Rescheduled, BookingStatus.Cancelled, BookingStatus.CancelledByUser],
      [BookingStatus.Rescheduled]: [BookingStatus.Confirmed, BookingStatus.Cancelled, BookingStatus.CancelledByUser],
      [BookingStatus.OnRide]: [BookingStatus.Completed, BookingStatus.Cancelled, BookingStatus.CancelledByUser],
      [BookingStatus.Completed]: [], // Terminal state
      [BookingStatus.Cancelled]: [], // Terminal state
      [BookingStatus.CancelledByUser]: [] // Terminal state
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      errors.push({ 
        field: 'statusTransition', 
        message: `Invalid status transition from ${currentStatus} to ${newStatus}` 
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate booking ID format
   */
  static validateBookingId(bookingId: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!bookingId || bookingId.trim() === '') {
      errors.push({ field: 'bookingId', message: 'Booking ID is required' });
    } else if (!/^[0-9a-fA-F]{24}$/.test(bookingId)) {
      errors.push({ field: 'bookingId', message: 'Invalid booking ID format' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate user ID format
   */
  static validateUserId(userId: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!userId || userId.trim() === '') {
      errors.push({ field: 'userId', message: 'User ID is required' });
    } else if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      errors.push({ field: 'userId', message: 'Invalid user ID format' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate driver ID format
   */
  static validateDriverId(driverId: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!driverId || driverId.trim() === '') {
      errors.push({ field: 'driverId', message: 'Driver ID is required' });
    } else if (!/^[0-9a-fA-F]{24}$/.test(driverId)) {
      errors.push({ field: 'driverId', message: 'Invalid driver ID format' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate taxi ID format
   */
  static validateTaxiId(taxiId: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!taxiId || taxiId.trim() === '') {
      errors.push({ field: 'taxiId', message: 'Taxi ID is required' });
    } else if (!/^[0-9a-fA-F]{24}$/.test(taxiId)) {
      errors.push({ field: 'taxiId', message: 'Invalid taxi ID format' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format validation errors for API response
   */
  static formatValidationErrors(errors: ValidationError[]): string {
    if (errors.length === 0) return '';
    
    return errors.map(error => `${error.field}: ${error.message}`).join('; ');
  }
}

export default BookingValidator;
