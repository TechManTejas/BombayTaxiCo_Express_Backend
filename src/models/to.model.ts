// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the To schema
interface ITo extends Document {
  name: string;
  status: 'Active' | 'Inactive';
}

const toSchema = new Schema<ITo>({
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

// Create and export the To model
const To = model<ITo>('To', toSchema);
export default To;
