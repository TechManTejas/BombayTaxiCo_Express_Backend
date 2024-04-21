// Import necessary libraries and modules
import express, { Router } from 'express';
import * as BookingController from '../controllers/booking.controller';
import Booking from '../models/booking.model';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';

// Create a router instance
const router: Router = express.Router();

// Define routes

router.get('/booking-status-counts', BookingController.getBookingStatusCounts);

router.get('/user-booking-status-counts', BookingController.getUserBookingStatusCounts);

router.get('/user-bookings', BookingController.getUserBookings);

router.post('/assign-taxi-driver', BookingController.assignTaxiDriver);

router.post('/reassign-taxi-driver', BookingController.reassignTaxiDriver);

router.post('/start-trip', BookingController.startTrip);

router.post('/end-trip', BookingController.endTrip);

router.use('/', generateCRUDRoutes(Booking, [
    { path: 'route_id', populate: { path: 'from_id to_id' } },
    { path: 'user_id' },
    { path: 'pickup_city' },
    { path: 'driver_id'},
    { path: 'taxi_id', populate: { path: 'taxi_type_id'}},
    { path: 'coupon_id'},
    { path: 'requested_taxi_type'}
  ]));

// Export the router
export default router;
