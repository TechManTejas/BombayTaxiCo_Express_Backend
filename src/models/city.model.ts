// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the City schema
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

// Create and export the City model
const City = model<ICity>('City', citySchema);
export default City;
