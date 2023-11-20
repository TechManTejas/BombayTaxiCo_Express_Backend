// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the FAQ schema
interface IFAQ extends Document {
  question: string;
  answer: string;
}

const faqSchema = new Schema<IFAQ>({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

// Create and export the FAQ model
const FAQ = model<IFAQ>('FAQ', faqSchema);
export default FAQ;
