// Import necessary libraries and modules
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// Controller function for user registration
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract user details from the request body
    const { mobile_no, email_id, name } = req.body;

    // Create a new user instance
    const newUser = new User({
      mobile_no,
      email_id,
      name,
    });

    // Save the user to the database
    await newUser.save();

    // Send a success response
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for user signin
export const signinUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract mobile number from the request body
    const { mobile_no } = req.body;

    // Find the user in the database based on the provided mobile number
    const user = await User.findOne({ mobile_no });

    // Check if the user exists
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Add OTP verification logic here if needed

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET_KEY || 'your-secret-key',
      // { expiresIn: null }
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
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Print the user's name (you can replace this with any desired action)
    console.log('User Name:', user.name);

    // Send a success response
    res.status(200).json({ message: 'User details retrieved successfully' });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Additional controller functions for OTP verification, password reset, etc., can be added based on your requirements.
