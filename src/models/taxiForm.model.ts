// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the TaxiForm schema
interface ITaxiForm extends Document {
  name: string;
  mobile_no: string;
  email_id: string;
  address: string;
  city_name: string;
  state_name: string;
  number_of_vehicles: number;
}

const taxiFormSchema = new Schema<ITaxiForm>({
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
  city_name: {
    type: String,
    required: true,
  },
  state_name: {
    type: String,
    required: true,
  },
  number_of_vehicles: {
    type: Number,
    required: true,
  },
});

// Create and export the TaxiForm model
const TaxiForm = model<ITaxiForm>('TaxiForm', taxiFormSchema);
export default TaxiForm;
