// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the CarFeature interface
interface ICarFeature {
  feature: string;
  icon: string;
}

// Define the TaxiType schema
export interface ITaxiType extends Document {
  image: string;
  name: string;
  description: string;
  price_hour: number;
  discount_percentage: number;
  car_features: ICarFeature[];
}

const carFeatureSchema = new Schema<ICarFeature>({
  feature: { type: String },
  icon: { type: String, required: true },
});

const taxiTypeSchema = new Schema<ITaxiType>({
  image: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price_hour: {
    type: Number,
    required: true,
  },
  discount_percentage: {
    type: Number,
    default: 0,
    validate: {
      validator: (value: number) => value >= 0 && value <= 100,
      message: 'Discount percentage must be between 0 and 100',
    },
  },
  car_features: {
    type: [carFeatureSchema],
    default: [],
  },
});

// Create and export the TaxiType model
const TaxiType = model<ITaxiType>('TaxiType', taxiTypeSchema);
export default TaxiType;
