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
  current_trip?: Schema.Types.ObjectId; 
  assigned_trips: Schema.Types.ObjectId[];
  completed_trips: Schema.Types.ObjectId[]; 
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
  current_trip: { type: Schema.Types.ObjectId, ref: 'Booking' }, 
  assigned_trips: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
  completed_trips: [{ type: Schema.Types.ObjectId, ref: 'Booking' }], 
});

// Create and export the Driver model
const Driver = model<IDriver>('Driver', driverSchema);
export default Driver;
