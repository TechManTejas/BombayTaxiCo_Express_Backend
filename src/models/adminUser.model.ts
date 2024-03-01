// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the Admin User schema
export interface IAdminUser extends Document {
    username: string;
    password: string;
}

const adminUserSchema = new Schema<IAdminUser>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

// Create and export the User model
const AdminUser = model<IAdminUser>('AdminUser', adminUserSchema);
export default AdminUser;
