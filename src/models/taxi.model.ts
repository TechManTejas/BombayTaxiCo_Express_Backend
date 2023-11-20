// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';
import { ITaxiType } from './taxiType.model';

// Define the Taxi schema
interface ITaxi extends Document {
  taxi_type_id: ITaxiType['_id'];
  taxi_no: string;
  rate_per_km: number;
  driving_license: string;
  car_features: Record<string, unknown>; // Assuming car_features is a JSON object
  fare_details: Record<string, unknown>; // Assuming fare_details is a JSON object
  taxi_status: 'Available' | 'Unavailable' | 'Assigned' | 'On a Trip';
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
  rate_per_km: {
    type: Number,
    required: true,
  },
  driving_license: {
    type: String,
    required: true,
  },
  car_features: {
    type: Schema.Types.Mixed,
  },
  fare_details: {
    type: Schema.Types.Mixed,
  },
  taxi_status: {
    type: String,
    enum: ['Available', 'Unavailable', 'Assigned', 'On a Trip'],
    default: 'Available',
    required: true,
  },
});

// Create and export the Taxi model
const Taxi = model<ITaxi>('Taxi', taxiSchema);
export default Taxi;
