// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Import the To and From models
import To from './to.model';
import From from './from.model';

// Define the Route schema
interface IRoute extends Document {
  from_id: typeof From;
  to_id: typeof To;
  one_way_cost: number;
  two_way_cost: number;
  round_trip_cost: number;
  hourly_rent: number;
  route_status: 'Active' | 'Inactive';
}

const routeSchema = new Schema<IRoute>({
  from_id: {
    type: Schema.Types.ObjectId,
    ref: 'From',
    required: true,
  },
  to_id: {
    type: Schema.Types.ObjectId,
    ref: 'To',
    required: true,
  },
  one_way_cost: {
    type: Number,
    required: true,
  },
  two_way_cost: {
    type: Number,
    required: true,
  },
  round_trip_cost: {
    type: Number,
    required: true,
  },
  hourly_rent: {
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
