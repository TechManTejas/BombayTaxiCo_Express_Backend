/**
 * Booking Routes
 * API routes for booking management
 */

import { Router } from 'express';
import BookingController from '../controllers/booking.controller.new';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const bookingController = new BookingController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/', bookingController.createBooking.bind(bookingController));

/**
 * @route   GET /api/bookings
 * @desc    Get bookings with filters and pagination
 * @access  Private
 */
router.get('/', bookingController.getBookings.bind(bookingController));

/**
 * @route   GET /api/bookings/stats
 * @desc    Get booking statistics
 * @access  Private
 */
router.get('/stats', bookingController.getBookingStats.bind(bookingController));

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private
 */
router.get('/:id', bookingController.getBookingById.bind(bookingController));

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update booking
 * @access  Private
 */
router.put('/:id', bookingController.updateBooking.bind(bookingController));

/**
 * @route   POST /api/bookings/:id/cancel
 * @desc    Cancel booking
 * @access  Private
 */
router.post('/:id/cancel', bookingController.cancelBooking.bind(bookingController));

/**
 * @route   POST /api/bookings/:id/confirm
 * @desc    Confirm booking
 * @access  Private (Driver/Admin)
 */
router.post('/:id/confirm', bookingController.confirmBooking.bind(bookingController));

/**
 * @route   POST /api/bookings/:id/start
 * @desc    Start trip
 * @access  Private (Driver)
 */
router.post('/:id/start', bookingController.startTrip.bind(bookingController));

/**
 * @route   POST /api/bookings/:id/complete
 * @desc    Complete trip
 * @access  Private (Driver)
 */
router.post('/:id/complete', bookingController.completeTrip.bind(bookingController));

/**
 * @route   GET /api/users/:userId/bookings
 * @desc    Get user booking history
 * @access  Private
 */
router.get('/users/:userId/bookings', bookingController.getUserBookingHistory.bind(bookingController));

/**
 * @route   GET /api/drivers/:driverId/bookings
 * @desc    Get driver booking history
 * @access  Private
 */
router.get('/drivers/:driverId/bookings', bookingController.getDriverBookingHistory.bind(bookingController));

export default router;
