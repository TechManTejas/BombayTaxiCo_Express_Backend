// Import necessary libraries and modules
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { client } from "../twilio/client";
import { sendEmail } from "../email/sendEmail";

// In-memory store for OTPs
interface OTPEntry {
  otp: string;
  mobile_no: string;
  email_id: string;
  name: string;
  expiration: Date;
}

var otpStore: OTPEntry[] = [];

const generateOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Function to send OTP via email
const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const message = `Your verification code is: ${otp}`;
  await sendEmail({
    to: email,
    subject: "Verify your account",
    message,
  });
};

// Function to send OTP via SMS
const sendOTPSMS = async (mobile: string, otp: string): Promise<void> => {
  await client.messages.create({
    body: `Your verification code is: ${otp}`,
    from: "+12183003986",
    to: mobile,
  });
};

const addOTPToStore = (
  mobile_no: string,
  email_id: string,
  name: string,
  otp: string
): void => {
  const expiration = new Date(new Date().getTime() + 5 * 60000); // OTP expires in 5 minutes
  otpStore.push({ mobile_no, email_id, name, otp, expiration });
};

const removeExpiredOTPs = (): void => {
  const now = new Date();
  otpStore = otpStore.filter((otp) => otp.expiration > now);
};

export const registerOrSignInUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { mobile_no, email_id, name } = req.body;

    const existingUser = await User.findOne({
      $or: [{ mobile_no }, { email_id }],
    });

    if (email_id) {
      if (existingUser) {
        res.status(409).json({ message: "User already exists, please login." });
        return;
      }
    }

    const otp = generateOTP();
    if (email_id) await sendOTPEmail(email_id, otp);
    if (mobile_no === '7666674367') await sendOTPSMS(`+91${mobile_no}`, otp);
    addOTPToStore(mobile_no, email_id, name, otp);

    res
      .status(200)
      .json({ message: "OTP sent, please verify to complete registration." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  const { otp } = req.body;

  // Remove expired OTPs before verification
  removeExpiredOTPs();

  // Find and verify OTP
  const otpEntry = otpStore.find(
    (entry) =>
      entry.otp === otp 
  );

  if (!otpEntry) {
    res.status(400).json({ message: "Invalid or expired OTP." });
    return;
  }

  const mobile_no = otpEntry.mobile_no
  const email_id = otpEntry.email_id
  const name = otpEntry.name

  // Create user and sign them in
  const newUser = new User({ mobile_no, email_id, name });
  await newUser.save();

  // Generate JWT token
  const token = jwt.sign(
    { userId: newUser._id },
    process.env.JWT_SECRET_KEY || "your-secret-key"
  );

  // Prepare user information
  const userInfo = {
    _id: newUser._id,
    name: name,
    email: email_id,
    mobile_no: mobile_no,
  };

  res.status(201).json({
    message: "User registered and signed in successfully",
    token,
    user: userInfo,
  });
};

export const verifyRegisteredUser = async (req: Request, res: Response): Promise<void> => {
  const { mobile_no, otp } = req.body;

  // Remove expired OTPs before verification
  removeExpiredOTPs();

  // Find and verify OTP
  const otpEntry = otpStore.find(entry =>
      entry.otp === otp &&
      (entry.mobile_no === mobile_no)
  );

  if (!otpEntry) {
      res.status(400).json({ message: "Invalid or expired OTP." });
      return;
  }

  // Find the user in the database based on the mobile number or email id
  const user = await User.findOne({ mobile_no });

  if (!user) {
      res.status(404).json({ message: "User not found, Please Register" });
      return;
  }

  // Generate a JWT token for the found user
  const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY || "your-secret-key"
  );

  // Prepare user information
  const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email_id,
      mobile_no: user.mobile_no,
  };

  res.status(200).json({
      message: "OTP verified successfully",
      token,
      user: userInfo,
  });
};

// Controller function for user registration
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Controller function for user signin
export const signinUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract mobile number from the request body
    const { mobile_no } = req.body;

    // Find the user in the database based on the provided mobile number
    const user = await User.findOne({ mobile_no });

    // Check if the user exists
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Add OTP verification logic here if needed

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY || "your-secret-key"
      // { expiresIn: null }
    );

    // Prepare user information to send, omitting sensitive fields like password
    const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email_id,
      mobile_no: user.mobile_no,
    };

    // Send the token in the response
    res.status(200).json({
      token,
      user: userInfo,
    });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Controller function to get user details
export const getUserDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get the user ID from the request (added by the authentication middleware)
    const userId = (req as any).userId;

    // Find the user in the database based on the user ID
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Send a success response
    res.status(200).json({ message: "User details retrieved successfully" });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Additional controller functions for OTP verification, password reset, etc., can be added based on your requirements.
