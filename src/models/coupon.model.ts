//  Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the Coupon schema
export interface ICoupon extends Document {
  name: string;
  discount_perc: number;
  from_date: Date;
  to_date: Date;
  forever: boolean;
  status: 'Active' | 'Inactive';
}

const couponSchema = new Schema<ICoupon>({
  name: {
    type: String,
    required: true,
  },
  discount_perc: {
    type: Number,
    required: true,
  },
  from_date: {
    type: Date,
    required: true,
  },
  to_date: {
    type: Date,
    required: true,
  },
  forever: {
    type: Boolean,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    required: true,
  },
});

// Create and export the Coupon model
const Coupon = model<ICoupon>('Coupon', couponSchema);
export default Coupon;
