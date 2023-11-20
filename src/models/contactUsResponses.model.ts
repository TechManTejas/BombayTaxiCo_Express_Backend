// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the ContactUsResponses schema
interface IContactUsResponses extends Document {
  name: string;
  mobile_no: string;
  email_id: string;
  message: string;
}

const contactUsResponsesSchema = new Schema<IContactUsResponses>({
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
  message: {
    type: String,
    required: true,
  },
});

// Create and export the ContactUsResponses model
const ContactUsResponses = model<IContactUsResponses>('ContactUsResponses', contactUsResponsesSchema);
export default ContactUsResponses;
