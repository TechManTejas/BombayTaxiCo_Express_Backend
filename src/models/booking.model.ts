// BookingModel.ts
import mongoose, { Document, Schema } from 'mongoose';

// Enum for booking status
enum BookingStatus {
  Requested = 'Requested',
  Cancelled = 'Cancelled',
  Declined = 'Declined',
  TaxiAndDriverAssigned = 'Taxi and Driver Assigned',
  Confirmed = 'Confirmed',
  Rescheduled = 'Rescheduled',
}

// Enum for trip status
enum TripStatus {
  Planned = 'Planned',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

// Booking schema
const bookingSchema = new Schema({
  route_id: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coupon_id: { type: Schema.Types.ObjectId, ref: 'Coupon' },
  taxi_id: { type: Schema.Types.ObjectId, ref: 'Taxi' },
  driver_id: { type: Schema.Types.ObjectId, ref: 'Driver' },
  pick_up_date: { type: Date, required: true },
  pick_up_time: { type: Date, required: true },
  return_date: { type: Date },
  return_time: { type: Date },
  hours_kms: { type: String },
  pickup_address: { type: String },
  drop_address: { type: String },
  additional_request: { type: String },
  payments: { type: Schema.Types.Mixed },
  total_cost: { type: Number },
  waiting_charges: { type: Number },
  other_charges: { type: Number },
  gst: { type: Number },
  user_feedback: { type: String },
  user_rating: { type: Number, min: 1, max: 5 },
  driver_feedback: { type: String },
  driver_rating: { type: Number },
  invoice: { type: Schema.Types.Mixed },
  booking_status: { type: String, enum: Object.values(BookingStatus), required: true },
  trip_status: { type: String, enum: Object.values(TripStatus) },
});

// Booking model
const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
