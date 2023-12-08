// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';
import { ITaxiType } from './taxiType.model';

// Define the Taxi schema
interface ITaxi extends Document {
  taxi_type_id: ITaxiType['_id'];
  taxi_no: string;
  driving_license: string;
  taxi_status: 'Available' | 'Unavailable' | 'Assigned' | 'On a Trip';
  current_trip?: Schema.Types.ObjectId; 
  assigned_trips: Schema.Types.ObjectId[];
  completed_trips: Schema.Types.ObjectId[]; 
}

const taxiSchema = new Schema<ITaxi>({
  taxi_type_id: {
    type: Schema.Types.ObjectId,
    ref: 'TaxiType',
    required: true,
  },
  taxi_no: {
    type: String,
    required: true,
  },
  driving_license: {
    type: String,
    required: true,
  },
  taxi_status: {
    type: String,
    enum: ['Available', 'Unavailable', 'Assigned', 'On a Trip'],
    default: 'Available',
    required: true,
  },
  current_trip: { type: Schema.Types.ObjectId, ref: 'Booking' }, 
  assigned_trips: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
  completed_trips: [{ type: Schema.Types.ObjectId, ref: 'Booking' }], 
});

// Create and export the Taxi model
const Taxi = model<ITaxi>('Taxi', taxiSchema);
export default Taxi;
