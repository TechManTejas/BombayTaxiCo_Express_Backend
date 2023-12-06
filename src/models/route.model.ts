// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Import the To and From models
import City from './city.model';

// Define the Route schema
interface IRoute extends Document {
  from_id: typeof City;
  to_id: typeof City;
  one_way_trip_km: number;
  round_trip_km: number;
  route_status: 'Active' | 'Inactive';
}

const routeSchema = new Schema<IRoute>({
  from_id: {
    type: Schema.Types.ObjectId,
    ref: 'City',
    required: true,
  },
  to_id: {
    type: Schema.Types.ObjectId,
    ref: 'City',
    required: true,
  },
  one_way_trip_km: {
    type: Number,
    required: true,
  },
  round_trip_km: {
    type: Number,
    required: true,
  },
  route_status: {
    type: String,
    enum: ['Active', 'Inactive'],
    required: true,
  },
});

// Create and export the Route model
const Route = model<IRoute>('Route', routeSchema);
export default Route;
