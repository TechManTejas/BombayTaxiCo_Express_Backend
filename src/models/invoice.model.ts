// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the Invoice schema
interface IInvoice extends Document {
  date: Date;
  booking: Schema.Types.ObjectId;
  amount: number;
}

const invoiceSchema = new Schema<IInvoice>({
  date: { type: Date, required: true },
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  amount: { type: Number, required: true },
});

// Create and export the Invoice model
const Invoice = model<IInvoice>('Invoice', invoiceSchema);
export default Invoice;
