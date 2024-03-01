// Import necessary libraries and modules
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import AdminUser from '../models/adminUser.model';
import { IAdminUser } from '../models/adminUser.model';

// Controller function for user signin
export const signinUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extract username and password from the request body
      const { username, password } = req.body;
  
      // Find the user in the database based on the provided username
      const user = await AdminUser.findOne({ username });
  
      // Check if the user exists
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      // Compare the provided password with the hashed password stored in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      // Check if the password is valid
      if (!isPasswordValid) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        { userId: user._id }, 
        process.env.JWT_SECRET_KEY || 'your-secret-key'
      );
  
      // Send the token in the response
      res.status(200).json({ token });
    } catch (error) {
      // Handle errors and send an error response
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

// Controller function to get user details
export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the user ID from the request (added by the authentication middleware)
    const userId = (req as any).userId;

    // Find the user in the database based on the user ID
    const user = await AdminUser.findById(userId);

    // Check if the user exists
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Print the user's name (you can replace this with any desired action)
    console.log('Username:', user.username);

    // Send a success response
    res.status(200).json({ message: 'User details retrieved successfully' });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Function to check if a user exists and create if not
export const createStaffUserIfNotExists = async (username: string, password: string) => {
    try {
      // Check if the user already exists
      const existingUser: IAdminUser | null = await AdminUser.findOne({ username });
  
      if (existingUser) {
        console.log('User already exists');
        return existingUser;
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user with all required fields, including the role
      const newStaff = await AdminUser.create({
        username,
        password: hashedPassword
      });
  
      console.log('User created successfully');
      return newStaff;
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      throw error;
    }
  };

// Additional controller functions for OTP verification, password reset, etc., can be added based on your requirements.
