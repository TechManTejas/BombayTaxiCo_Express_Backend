// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the CarFeature interface
interface ICarFeature {
  feature: string;
}

// Define the TaxiType schema
export interface ITaxiType extends Document {
  name: string;
  price_km: number;
  price_hour: number;
  car_features: ICarFeature[];
}

const carFeatureSchema = new Schema<ICarFeature>({
  feature: {
    type: String,
    required: true,
  },
});

const taxiTypeSchema = new Schema<ITaxiType>({
  name: {
    type: String,
    required: true,
  },
  price_km: {
    type: Number,
    required: true,
  },
  price_hour: {
    type: Number,
    required: true,
  },
  car_features: {
    type: [carFeatureSchema], // Array of objects
    default: [],              // Default value as an empty array
  },
});

// Create and export the TaxiType model
const TaxiType = model<ITaxiType>('TaxiType', taxiTypeSchema);
export default TaxiType;
