// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the TaxiType schema
export interface ITaxiType extends Document {
  name: string;
}

const taxiTypeSchema = new Schema<ITaxiType>({
  name: {
    type: String,
    required: true,
  },
});

// Create and export the TaxiType model
const TaxiType = model<ITaxiType>('TaxiType', taxiTypeSchema);
export default TaxiType;
