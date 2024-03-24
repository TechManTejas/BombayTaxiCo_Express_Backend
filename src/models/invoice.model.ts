// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the Invoice schema
interface IInvoice extends Document {
  user_id: Schema.Types.ObjectId;
  date: Date;
  booking: Schema.Types.ObjectId;
  amount: number;
  cashPaid: number;
  amountDue: number;
}

const invoiceSchema = new Schema<IInvoice>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  amount: { type: Number, required: true },
  cashPaid: { type: Number, required: true, default: 0 },
  amountDue: { type: Number, required: true, default: 0 },
});

// Create and export the Invoice model
const Invoice = model<IInvoice>('Invoice', invoiceSchema);
export default Invoice;
