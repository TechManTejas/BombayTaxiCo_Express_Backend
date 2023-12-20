// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Enum for booking status
export enum BookingStatus {
  New = 'New',
  Confirmed = 'Confirmed',
  OnRide = 'On Ride',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

// Enum for trip type
export enum TripType {
  OneWay = 'One-Way Trip',
  Round = 'Round Trip',
  Hourly = 'Hourly Rental',
}

// Define the Booking schema
interface IBooking extends Document {
  pickup_city?: Schema.Types.ObjectId,
  route_id?: Schema.Types.ObjectId;
  user_id: Schema.Types.ObjectId;
  coupon_id?: Schema.Types.ObjectId;
  taxi_id?: Schema.Types.ObjectId;
  driver_id?: Schema.Types.ObjectId;
  requested_taxi_type: Schema.Types.ObjectId; 
  pick_up_date: Date;
  pick_up_time: string;
  return_date?: Date;
  hours_kms?: string;
  pickup_address?: string;
  drop_address?: string;
  additional_request?: string;
  payments?: Schema.Types.Mixed;
  base_fare?: number;
  total_cost?: number;
  waiting_charges?: number;
  other_charges?: number;
  gst?: number;
  invoice?: Schema.Types.Mixed;
  booking_status?: BookingStatus;
  trip_type: TripType;
}

// Define the Booking schema
const bookingSchema = new Schema<IBooking>({
  pickup_city: { type: Schema.Types.ObjectId, ref: 'City' },
  route_id: { type: Schema.Types.ObjectId, ref: 'Route' },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coupon_id: { type: Schema.Types.ObjectId, ref: 'Coupon' },
  taxi_id: { type: Schema.Types.ObjectId, ref: 'Taxi' },
  driver_id: { type: Schema.Types.ObjectId, ref: 'Driver' },
  requested_taxi_type: { type: Schema.Types.ObjectId, ref: 'TaxiType', required: true }, 
  pick_up_date: { type: Date, required: true },
  pick_up_time: { type: String },
  return_date: { type: Date },
  hours_kms: { type: String },
  pickup_address: { type: String },
  drop_address: { type: String },
  additional_request: { type: String },
  payments: { type: Schema.Types.Mixed },
  base_fare: { type: Number },
  waiting_charges: { type: Number },
  other_charges: { type: Number },
  gst: { type: Number },
  total_cost: { type: Number },
  invoice: { type: Schema.Types.Mixed },
  booking_status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.New },
  trip_type: { type: String, enum: Object.values(TripType), required: true }, 
});

// Create and export the Booking model
const Booking = model<IBooking>('Booking', bookingSchema);
export default Booking;
