/**
 * Booking Controller
 * REST API endpoints for booking management
 */

import { Request, Response } from 'express';
import BookingService, { CreateBookingRequest, BookingUpdateRequest, BookingFilters } from '../services/booking.service';
import { BookingStatus } from '../models/booking.model';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = BookingService.getInstance();
  }

  /**
   * Create a new booking
   * POST /api/bookings
   */
  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingRequest: CreateBookingRequest = req.body;
      
      // Validate required fields
      if (!bookingRequest.userId || !bookingRequest.taxiId || !bookingRequest.pickupAddress || 
          !bookingRequest.dropAddress || !bookingRequest.pickupDate || !bookingRequest.pickupTime) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await this.bookingService.createBooking(bookingRequest);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Controller error in createBooking:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update booking
   * PUT /api/bookings/:id
   */
  async updateBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateRequest: BookingUpdateRequest = req.body;

      const result = await this.bookingService.updateBooking(id, updateRequest);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date().toISOString()
        });
      } else {
        const statusCode = result.error === 'BOOKING_NOT_FOUND' ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Controller error in updateBooking:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get booking by ID
   * GET /api/bookings/:id
   */
  async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await this.bookingService.getBookingById(id);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date().toISOString()
        });
      } else {
        const statusCode = result.error === 'BOOKING_NOT_FOUND' ? 404 : 500;
        res.status(statusCode).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Controller error in getBookingById:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get bookings with filters
   * GET /api/bookings
   */
  async getBookings(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId,
        driverId,
        bookingStatus,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount,
        page = '1',
        limit = '20'
      } = req.query;

      const filters: BookingFilters = {};
      
      if (userId) filters.userId = userId as string;
      if (driverId) filters.driverId = driverId as string;
      if (bookingStatus) {
        filters.bookingStatus = Array.isArray(bookingStatus) 
          ? bookingStatus as BookingStatus[]
          : [bookingStatus as BookingStatus];
      }
      if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
      if (dateTo) filters.dateTo = new Date(dateTo as string);
      if (minAmount) filters.minAmount = parseFloat(minAmount as string);
      if (maxAmount) filters.maxAmount = parseFloat(maxAmount as string);

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      const result = await this.bookingService.getBookings(filters, pageNum, limitNum);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Controller error in getBookings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get booking statistics
   * GET /api/bookings/stats
   */
  async getBookingStats(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId,
        driverId,
        bookingStatus,
        dateFrom,
        dateTo
      } = req.query;

      const filters: BookingFilters = {};
      
      if (userId) filters.userId = userId as string;
      if (driverId) filters.driverId = driverId as string;
      if (bookingStatus) {
        filters.bookingStatus = Array.isArray(bookingStatus) 
          ? bookingStatus as BookingStatus[]
          : [bookingStatus as BookingStatus];
      }
      if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
      if (dateTo) filters.dateTo = new Date(dateTo as string);

      const result = await this.bookingService.getBookingStats(filters);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Controller error in getBookingStats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Cancel booking
   * POST /api/bookings/:id/cancel
   */
  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const result = await this.bookingService.cancelBooking(id, reason);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date().toISOString()
        });
      } else {
        const statusCode = result.error === 'BOOKING_NOT_FOUND' ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Controller error in cancelBooking:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Confirm booking
   * POST /api/bookings/:id/confirm
   */
  async confirmBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { driverId } = req.body;

      const result = await this.bookingService.confirmBooking(id, driverId);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date().toISOString()
        });
      } else {
        const statusCode = result.error === 'BOOKING_NOT_FOUND' ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Controller error in confirmBooking:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Start trip
   * POST /api/bookings/:id/start
   */
  async startTrip(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await this.bookingService.startTrip(id);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date().toISOString()
        });
      } else {
        const statusCode = result.error === 'BOOKING_NOT_FOUND' ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Controller error in startTrip:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Complete trip
   * POST /api/bookings/:id/complete
   */
  async completeTrip(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { waitingCharges, otherCharges } = req.body;

      const result = await this.bookingService.completeTrip(id, { waitingCharges, otherCharges });
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date().toISOString()
        });
      } else {
        const statusCode = result.error === 'BOOKING_NOT_FOUND' ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Controller error in completeTrip:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get user booking history
   * GET /api/users/:userId/bookings
   */
  async getUserBookingHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = '1', limit = '20' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      const result = await this.bookingService.getUserBookingHistory(userId, pageNum, limitNum);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Controller error in getUserBookingHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get driver booking history
   * GET /api/drivers/:driverId/bookings
   */
  async getDriverBookingHistory(req: Request, res: Response): Promise<void> {
    try {
      const { driverId } = req.params;
      const { page = '1', limit = '20' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      const result = await this.bookingService.getDriverBookingHistory(driverId, pageNum, limitNum);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Controller error in getDriverBookingHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default BookingController;
