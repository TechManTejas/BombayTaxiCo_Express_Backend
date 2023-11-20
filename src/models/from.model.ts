// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the From schema
interface IFrom extends Document {
  name: string;
  status: 'Active' | 'Inactive';
}

const fromSchema = new Schema<IFrom>({
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
const From = model<IFrom>('From', fromSchema);
export default From;
