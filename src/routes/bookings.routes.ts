// Import necessary libraries and modules
import express, { Router } from 'express';
import * as BookingController from '../controllers/booking.controller';

// Create a router instance
const router: Router = express.Router();

// Define routes
router.post('/', BookingController.createBooking);
router.get('/', BookingController.getAllBookings);
router.get('/:id', BookingController.getBookingById);
router.put('/:id', BookingController.updateBookingById);
router.delete('/:id', BookingController.deleteBookingById);

// Export the router
export default router;
