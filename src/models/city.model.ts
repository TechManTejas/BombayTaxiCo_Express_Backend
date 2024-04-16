// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the From schema
export interface ICity extends Document {
  name: string;
  status: 'Active' | 'Inactive';
}

const citySchema = new Schema<ICity>({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
});

// Create and export the From model
const City = model<ICity>('City', citySchema);
export default City;
