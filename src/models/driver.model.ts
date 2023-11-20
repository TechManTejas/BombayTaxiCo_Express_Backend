// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the Driver schema
interface IDriver extends Document {
  name: string;
  mobile_no: string;
  email_id: string;
  address: string;
  driving_license: string;
  driver_status: 'Available' | 'Unavailable' | 'Assigned' | 'On a Trip';
}

const driverSchema = new Schema<IDriver>({
  name: {
    type: String,
    required: true,
  },
  mobile_no: {
    type: String,
    required: true,
  },
  email_id: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  driving_license: {
    type: String,
    required: true,
  },
  driver_status: {
    type: String,
    enum: ['Available', 'Unavailable', 'Assigned', 'On a Trip'],
    default: 'Available',
    required: true,
  },
});

// Create and export the Driver model
const Driver = model<IDriver>('Driver', driverSchema);
export default Driver;
