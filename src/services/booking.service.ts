/**
 * Booking Service
 * Comprehensive booking management service with validation, status tracking, and notifications
 */

import Booking, { IBooking, BookingStatus, TripType } from '../models/booking.model';
import Taxi, { ITaxi } from '../models/taxi.model';
import User, { IUser } from '../models/user.model';

export interface CreateBookingRequest {
  userId: string;
  taxiId: string;
  pickupAddress: string;
  dropAddress: string;
  pickupDate: Date;
  pickupTime: string;
  tripType: TripType;
  baseFare: number;
  additionalCharges?: number;
  discountAmount?: number;
  name: string;
  emailId: string;
  contactNumber: string;
  whatsAppNumber: string;
  address: string;
  numberOfPassengers: string;
  numberOfSmallBags: string;
  numberOfLargeBags: string;
  additionalRequest?: string;
  gender: string;
  seniorCitizen: boolean;
  womenTraveling: boolean;
  kidsOnBoard: boolean;
  englishSpeakingDriver: boolean;
  carryingPet: boolean;
  need7Plus1Seater: boolean;
  carrierOverTop: boolean;
  bookingForSomeoneElse: boolean;
  otherDetails: string;
}

export interface BookingUpdateRequest {
  bookingStatus?: BookingStatus;
  driverId?: string;
  actualPickupTime?: Date;
  actualDropoffTime?: Date;
  additionalCharges?: number;
  waitingCharges?: number;
  otherCharges?: number;
  additionalRequest?: string;
}

export interface BookingFilters {
  userId?: string;
  driverId?: string;
  bookingStatus?: BookingStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface BookingStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  newBookings: number;
  totalRevenue: number;
  averageFare: number;
  completionRate: number;
  cancellationRate: number;
}

export class BookingService {
  private static instance: BookingService;

  private constructor() {}

  static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  /**
   * Create a new booking
   */
  async createBooking(request: CreateBookingRequest): Promise<{ success: boolean; message: string; data?: IBooking; error?: string }> {
    try {
      console.log('Creating new booking', { userId: request.userId, taxiId: request.taxiId });

      // Validate user exists
      const user = await User.findById(request.userId);
      if (!user) {
        return { success: false, message: 'User not found', error: 'USER_NOT_FOUND' };
      }

      // Validate taxi exists and is available
      const taxi = await Taxi.findById(request.taxiId);
      if (!taxi) {
        return { success: false, message: 'Taxi not found', error: 'TAXI_NOT_FOUND' };
      }

      if (taxi.taxi_status !== 'Available') {
        return { success: false, message: 'Taxi is not available', error: 'TAXI_NOT_AVAILABLE' };
      }

      // Calculate total fare
      const totalFare = this.calculateTotalFare(request.baseFare, request.additionalCharges, request.discountAmount);

      // Create booking
      const booking = new Booking({
        user_id: request.userId,
        taxi_id: request.taxiId,
        pickup_address: request.pickupAddress,
        drop_address: request.dropAddress,
        pick_up_date: request.pickupDate,
        pick_up_time: request.pickupTime,
        trip_type: request.tripType,
        base_fare: request.baseFare,
        additional_charges: request.additionalCharges || 0,
        discount_amount: request.discountAmount || 0,
        total_cost: totalFare,
        booking_status: BookingStatus.New,
        name: request.name,
        emailId: request.emailId,
        contactNumber: request.contactNumber,
        whatsAppNumber: request.whatsAppNumber,
        address: request.address,
        numberOfPassengers: request.numberOfPassengers,
        numberOfSmallBags: request.numberOfSmallBags,
        numberOfLargeBags: request.numberOfLargeBags,
        additional_request: request.additionalRequest,
        gender: request.gender,
        seniorCitizen: request.seniorCitizen,
        womenTraveling: request.womenTraveling,
        kidsOnBoard: request.kidsOnBoard,
        englishSpeakingDriver: request.englishSpeakingDriver,
        carryingPet: request.carryingPet,
        need7Plus1Seater: request.need7Plus1Seater,
        carrierOverTop: request.carrierOverTop,
        bookingForSomeoneElse: request.bookingForSomeoneElse,
        otherDetails: request.otherDetails,
        notified: false
      });

      await booking.save();

      // Update taxi status
      taxi.taxi_status = 'Assigned';
      await taxi.save();

      console.log('Booking created successfully', { bookingId: booking._id, userId: request.userId });

      return {
        success: true,
        message: 'Booking created successfully',
        data: booking
      };

    } catch (error) {
      console.error('Error creating booking', error);
      return {
        success: false,
        message: 'Failed to create booking',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update booking status and details
   */
  async updateBooking(bookingId: string, request: BookingUpdateRequest): Promise<{ success: boolean; message: string; data?: IBooking; error?: string }> {
    try {
      console.log('Updating booking', { bookingId });

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return { success: false, message: 'Booking not found', error: 'BOOKING_NOT_FOUND' };
      }

      // Validate status transitions
      if (request.bookingStatus && !this.isValidStatusTransition(booking.booking_status, request.bookingStatus)) {
        return { 
          success: false, 
          message: `Invalid status transition from ${booking.booking_status} to ${request.bookingStatus}`, 
          error: 'INVALID_STATUS_TRANSITION' 
        };
      }

      // Update booking fields
      if (request.bookingStatus) booking.booking_status = request.bookingStatus;
      if (request.driverId) booking.driver_id = request.driverId;
      if (request.additionalCharges) booking.additional_charges = request.additionalCharges;
      if (request.waitingCharges) booking.waiting_charges = request.waitingCharges;
      if (request.otherCharges) booking.other_charges = request.otherCharges;
      if (request.additionalRequest) booking.additional_request = request.additionalRequest;

      // Recalculate total fare if charges changed
      if (request.additionalCharges || request.waitingCharges || request.otherCharges) {
        const baseFare = booking.base_fare || 0;
        const additionalCharges = request.additionalCharges || booking.additional_charges || 0;
        const waitingCharges = request.waitingCharges || booking.waiting_charges || 0;
        const otherCharges = request.otherCharges || booking.other_charges || 0;
        const discountAmount = booking.discount_amount || 0;
        
        booking.total_cost = this.calculateTotalFare(baseFare, additionalCharges + waitingCharges + otherCharges, discountAmount);
      }

      await booking.save();

      // Update taxi status if booking is cancelled or completed
      if (request.bookingStatus === BookingStatus.Cancelled || request.bookingStatus === BookingStatus.Completed) {
        const taxi = await Taxi.findById(booking.taxi_id);
        if (taxi) {
          taxi.taxi_status = 'Available';
          await taxi.save();
        }
      }

      console.log('Booking updated successfully', { bookingId, status: request.bookingStatus });

      return {
        success: true,
        message: 'Booking updated successfully',
        data: booking
      };

    } catch (error) {
      console.error('Error updating booking', error);
      return {
        success: false,
        message: 'Failed to update booking',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<{ success: boolean; message: string; data?: IBooking; error?: string }> {
    try {
      const booking = await Booking.findById(bookingId)
        .populate('user_id', 'name email_id mobile_no')
        .populate('taxi_id', 'taxi_no taxi_status')
        .populate('driver_id', 'name email_id mobile_no');

      if (!booking) {
        return { success: false, message: 'Booking not found', error: 'BOOKING_NOT_FOUND' };
      }

      return {
        success: true,
        message: 'Booking retrieved successfully',
        data: booking
      };

    } catch (error) {
      console.error('Error retrieving booking', error);
      return {
        success: false,
        message: 'Failed to retrieve booking',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get bookings with filters
   */
  async getBookings(filters: BookingFilters, page: number = 1, limit: number = 20): Promise<{ 
    success: boolean; 
    message: string; 
    data?: { bookings: IBooking[], total: number, page: number, totalPages: number }; 
    error?: string 
  }> {
    try {
      const query: any = {};

      // Build query from filters
      if (filters.userId) query.user_id = filters.userId;
      if (filters.driverId) query.driver_id = filters.driverId;
      if (filters.bookingStatus && filters.bookingStatus.length > 0) query.booking_status = { $in: filters.bookingStatus };
      if (filters.dateFrom || filters.dateTo) {
        query.pick_up_date = {};
        if (filters.dateFrom) query.pick_up_date.$gte = filters.dateFrom;
        if (filters.dateTo) query.pick_up_date.$lte = filters.dateTo;
      }
      if (filters.minAmount || filters.maxAmount) {
        query.total_cost = {};
        if (filters.minAmount) query.total_cost.$gte = filters.minAmount;
        if (filters.maxAmount) query.total_cost.$lte = filters.maxAmount;
      }

      // Apply pagination
      const skip = (page - 1) * limit;

      const bookings = await Booking.find(query)
        .populate('user_id', 'name email_id mobile_no')
        .populate('taxi_id', 'taxi_no taxi_status')
        .populate('driver_id', 'name email_id mobile_no')
        .sort({ pick_up_date: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Booking.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Bookings retrieved successfully',
        data: {
          bookings,
          total,
          page,
          totalPages
        }
      };

    } catch (error) {
      console.error('Error retrieving bookings', error);
      return {
        success: false,
        message: 'Failed to retrieve bookings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(filters?: BookingFilters): Promise<{ success: boolean; message: string; data?: BookingStats; error?: string }> {
    try {
      const matchStage: any = {};

      // Build aggregation pipeline from filters
      if (filters?.userId) matchStage.user_id = filters.userId;
      if (filters?.driverId) matchStage.driver_id = filters.driverId;
      if (filters?.bookingStatus && filters.bookingStatus.length > 0) matchStage.booking_status = { $in: filters.bookingStatus };
      if (filters?.dateFrom || filters?.dateTo) {
        matchStage.pick_up_date = {};
        if (filters.dateFrom) matchStage.pick_up_date.$gte = filters.dateFrom;
        if (filters.dateTo) matchStage.pick_up_date.$lte = filters.dateTo;
      }

      const stats = await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            completedBookings: {
              $sum: { $cond: [{ $eq: ['$booking_status', BookingStatus.Completed] }, 1, 0] }
            },
            cancelledBookings: {
              $sum: { $cond: [{ $eq: ['$booking_status', BookingStatus.Cancelled] }, 1, 0] }
            },
            cancelledByUserBookings: {
              $sum: { $cond: [{ $eq: ['$booking_status', BookingStatus.CancelledByUser] }, 1, 0] }
            },
            newBookings: {
              $sum: { $cond: [{ $eq: ['$booking_status', BookingStatus.New] }, 1, 0] }
            },
            totalRevenue: {
              $sum: { $cond: [{ $eq: ['$booking_status', BookingStatus.Completed] }, '$total_cost', 0] }
            },
            averageFare: { $avg: '$total_cost' }
          }
        }
      ]);

      const result = stats[0] || {
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        cancelledByUserBookings: 0,
        newBookings: 0,
        totalRevenue: 0,
        averageFare: 0
      };

      const bookingStats: BookingStats = {
        totalBookings: result.totalBookings,
        completedBookings: result.completedBookings,
        cancelledBookings: result.cancelledBookings + result.cancelledByUserBookings,
        newBookings: result.newBookings,
        totalRevenue: result.totalRevenue,
        averageFare: result.averageFare || 0,
        completionRate: result.totalBookings > 0 ? (result.completedBookings / result.totalBookings) * 100 : 0,
        cancellationRate: result.totalBookings > 0 ? ((result.cancelledBookings + result.cancelledByUserBookings) / result.totalBookings) * 100 : 0
      };

      return {
        success: true,
        message: 'Booking statistics retrieved successfully',
        data: bookingStats
      };

    } catch (error) {
      console.error('Error retrieving booking statistics', error);
      return {
        success: false,
        message: 'Failed to retrieve booking statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<{ success: boolean; message: string; data?: IBooking; error?: string }> {
    try {
      console.log('Cancelling booking', { bookingId });

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return { success: false, message: 'Booking not found', error: 'BOOKING_NOT_FOUND' };
      }

      // Check if booking can be cancelled
      if (booking.booking_status === BookingStatus.Completed || 
          booking.booking_status === BookingStatus.Cancelled || 
          booking.booking_status === BookingStatus.CancelledByUser) {
        return { success: false, message: 'Booking cannot be cancelled', error: 'BOOKING_CANNOT_BE_CANCELLED' };
      }

      booking.booking_status = BookingStatus.CancelledByUser;
      if (reason) booking.additional_request = reason;
      await booking.save();

      // Update taxi status
      const taxi = await Taxi.findById(booking.taxi_id);
      if (taxi) {
        taxi.taxi_status = 'Available';
        await taxi.save();
      }

      console.log('Booking cancelled successfully', { bookingId });

      return {
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
      };

    } catch (error) {
      console.error('Error cancelling booking', error);
      return {
        success: false,
        message: 'Failed to cancel booking',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate total fare
   */
  private calculateTotalFare(baseFare: number, additionalCharges: number = 0, discountAmount: number = 0): number {
    return Math.max(0, baseFare + additionalCharges - discountAmount);
  }

  /**
   * Validate status transition
   */
  private isValidStatusTransition(currentStatus: BookingStatus, newStatus: BookingStatus): boolean {
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.New]: [BookingStatus.Confirmed, BookingStatus.Cancelled, BookingStatus.CancelledByUser],
      [BookingStatus.Confirmed]: [BookingStatus.OnRide, BookingStatus.Rescheduled, BookingStatus.Cancelled, BookingStatus.CancelledByUser],
      [BookingStatus.Rescheduled]: [BookingStatus.Confirmed, BookingStatus.Cancelled, BookingStatus.CancelledByUser],
      [BookingStatus.OnRide]: [BookingStatus.Completed, BookingStatus.Cancelled, BookingStatus.CancelledByUser],
      [BookingStatus.Completed]: [], // Terminal state
      [BookingStatus.Cancelled]: [], // Terminal state
      [BookingStatus.CancelledByUser]: [] // Terminal state
    };

    return validTransitions[currentStatus].includes(newStatus);
  }

  /**
   * Get user booking history
   */
  async getUserBookingHistory(userId: string, page: number = 1, limit: number = 20): Promise<{ 
    success: boolean; 
    message: string; 
    data?: { bookings: IBooking[], total: number, page: number, totalPages: number }; 
    error?: string 
  }> {
    try {
      const filters: BookingFilters = { userId };
      return this.getBookings(filters, page, limit);
    } catch (error) {
      console.error('Error retrieving user booking history', error);
      return {
        success: false,
        message: 'Failed to retrieve user booking history',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get driver booking history
   */
  async getDriverBookingHistory(driverId: string, page: number = 1, limit: number = 20): Promise<{ 
    success: boolean; 
    message: string; 
    data?: { bookings: IBooking[], total: number, page: number, totalPages: number }; 
    error?: string 
  }> {
    try {
      const filters: BookingFilters = { driverId };
      return this.getBookings(filters, page, limit);
    } catch (error) {
      console.error('Error retrieving driver booking history', error);
      return {
        success: false,
        message: 'Failed to retrieve driver booking history',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Confirm booking
   */
  async confirmBooking(bookingId: string, driverId?: string): Promise<{ success: boolean; message: string; data?: IBooking; error?: string }> {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return { success: false, message: 'Booking not found', error: 'BOOKING_NOT_FOUND' };
      }

      if (booking.booking_status !== BookingStatus.New) {
        return { success: false, message: 'Booking cannot be confirmed', error: 'BOOKING_CANNOT_BE_CONFIRMED' };
      }

      booking.booking_status = BookingStatus.Confirmed;
      if (driverId) booking.driver_id = driverId;
      await booking.save();

      return {
        success: true,
        message: 'Booking confirmed successfully',
        data: booking
      };

    } catch (error) {
      console.error('Error confirming booking', error);
      return {
        success: false,
        message: 'Failed to confirm booking',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Start trip
   */
  async startTrip(bookingId: string): Promise<{ success: boolean; message: string; data?: IBooking; error?: string }> {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return { success: false, message: 'Booking not found', error: 'BOOKING_NOT_FOUND' };
      }

      if (booking.booking_status !== BookingStatus.Confirmed) {
        return { success: false, message: 'Trip cannot be started', error: 'TRIP_CANNOT_BE_STARTED' };
      }

      booking.booking_status = BookingStatus.OnRide;
      await booking.save();

      // Update taxi status
      const taxi = await Taxi.findById(booking.taxi_id);
      if (taxi) {
        taxi.taxi_status = 'On a Trip';
        await taxi.save();
      }

      return {
        success: true,
        message: 'Trip started successfully',
        data: booking
      };

    } catch (error) {
      console.error('Error starting trip', error);
      return {
        success: false,
        message: 'Failed to start trip',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Complete trip
   */
  async completeTrip(bookingId: string, finalCharges?: { waitingCharges?: number; otherCharges?: number }): Promise<{ success: boolean; message: string; data?: IBooking; error?: string }> {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return { success: false, message: 'Booking not found', error: 'BOOKING_NOT_FOUND' };
      }

      if (booking.booking_status !== BookingStatus.OnRide) {
        return { success: false, message: 'Trip cannot be completed', error: 'TRIP_CANNOT_BE_COMPLETED' };
      }

      booking.booking_status = BookingStatus.Completed;
      
      if (finalCharges) {
        if (finalCharges.waitingCharges) booking.waiting_charges = finalCharges.waitingCharges;
        if (finalCharges.otherCharges) booking.other_charges = finalCharges.otherCharges;
        
        // Recalculate total cost
        const baseFare = booking.base_fare || 0;
        const additionalCharges = booking.additional_charges || 0;
        const waitingCharges = finalCharges.waitingCharges || booking.waiting_charges || 0;
        const otherCharges = finalCharges.otherCharges || booking.other_charges || 0;
        const discountAmount = booking.discount_amount || 0;
        
        booking.total_cost = this.calculateTotalFare(baseFare, additionalCharges + waitingCharges + otherCharges, discountAmount);
      }
      
      await booking.save();

      // Update taxi status
      const taxi = await Taxi.findById(booking.taxi_id);
      if (taxi) {
        taxi.taxi_status = 'Available';
        await taxi.save();
      }

      return {
        success: true,
        message: 'Trip completed successfully',
        data: booking
      };

    } catch (error) {
      console.error('Error completing trip', error);
      return {
        success: false,
        message: 'Failed to complete trip',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default BookingService;
