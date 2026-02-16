// Import necessary libraries and modules
import mongoose, { Schema, model, Document } from 'mongoose';
import { IUser } from './user.model';
import { ITaxi } from './taxi.model';
import { IRoute } from './route.model';

// Enum for booking status
export enum BookingStatus {
  New = 'New',
  Confirmed = 'Confirmed',
  Rescheduled = 'Rescheduled',
  OnRide = 'On Ride',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  CancelledByUser = 'CancelledByUser',
}

// Enum for trip type
export enum TripType {
  OneWay = 'One-Way Trip',
  Round = 'Round Trip',
  Hourly = 'Hourly Rental',
}

// Define the Booking schema
export interface IBooking extends Document {
  pickup_city?: Schema.Types.ObjectId;
  route_id?: IRoute;
  user_id: IUser;
  coupon_id?: Schema.Types.ObjectId;
  taxi_id?: ITaxi;
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
  name: string;
  gender: string;
  emailId: string;
  contactNumber: string;
  whatsAppNumber: string;
  pincode?: string;
  address: string;
  notified: boolean;
  numberOfPassengers: string;
  numberOfSmallBags: string;
  numberOfLargeBags: string;
  seniorCitizen: boolean;
  womenTraveling: boolean;
  kidsOnBoard: boolean;
  englishSpeakingDriver: boolean;
  carryingPet: boolean;
  need7Plus1Seater: boolean;
  carrierOverTop: boolean;
  bookingForSomeoneElse: boolean;
  otherDetails: string;
  booking_number?: number; // Adding the auto-increment field
}

// Define the Counter schema for auto-increment
const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

// Create the Counter model
const Counter = model('Counter', counterSchema);

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
  name: { type: String },
  gender: { type: String },
  emailId: { type: String },
  contactNumber: { type: String },
  whatsAppNumber: { type: String },
  pincode: { type: String },
  address: { type: String },
  notified: { type: Boolean, default: false },
  numberOfPassengers: { type: String },
  numberOfSmallBags: { type: String },
  numberOfLargeBags: { type: String },
  seniorCitizen: { type: Boolean, default: false },
  womenTraveling: { type: Boolean, default: false },
  kidsOnBoard: { type: Boolean, default: false },
  englishSpeakingDriver: { type: Boolean, default: false },
  carryingPet: { type: Boolean, default: false },
  need7Plus1Seater: { type: Boolean, default: false },
  carrierOverTop: { type: Boolean, default: false },
  bookingForSomeoneElse: { type: Boolean, default: false },
  otherDetails: { type: String },
  booking_number: { type: Number }, // Add this line to define the booking_number field
}, {
  timestamps: true
});

// Pre-save hook to increment the booking_number
bookingSchema.pre<IBooking>('save', async function (next) {
  const doc = this;
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'booking_number' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  doc.booking_number = counter!.seq;
  next();
});

// Helper to check if a status string is a valid BookingStatus
export const isValidBookingStatus = (status: string | null | undefined): boolean => {
  if (!status) return false;
  const trimmed = String(status).trim();
  if (!trimmed) return false;
  return Object.values(BookingStatus).includes(trimmed as BookingStatus);
};

// Helper to check if a trip type string is valid
export const isValidTripType = (tripType: string | null | undefined): boolean => {
  if (!tripType) return false;
  const trimmed = String(tripType).trim();
  if (!trimmed) return false;
  return Object.values(TripType).includes(trimmed as TripType);
};

// Create and export the Booking model
const Booking = model<IBooking>('Booking', bookingSchema);
export default Booking;
