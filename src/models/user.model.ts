// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the User schema
interface IUser extends Document {
  mobile_no: string;
  email_id: string;
  name: string;
}

const userSchema = new Schema<IUser>({
  mobile_no: {
    type: String,
    required: true,
    unique: true,
  },
  email_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
});

// Create and export the User model
const User = model<IUser>('User', userSchema);
export default User;
