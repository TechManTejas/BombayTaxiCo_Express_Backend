// Import necessary libraries and modules
import { Request, Response } from 'express';
import Coupon from '../models/coupon.model';

// Controller function for creating a Coupon
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract Coupon details from the request body
    const { name, discount_perc, from_date, to_date, forever, status } = req.body;

    // Create a new Coupon instance
    const newCoupon = new Coupon({
      name,
      discount_perc,
      from_date,
      to_date,
      forever,
      status,
    });

    // Save the Coupon to the database
    await newCoupon.save();

    // Send a success response
    res.status(201).json({ message: 'Coupon created successfully' });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for getting all Coupons with dynamic filtering
export const getAllCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    // Dynamic filtering: construct filter object from query parameters
    const filter: Record<string, any> = {};

    for (const key in req.query) {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        filter[key] = req.query[key];
      }
    }

    // Fetch Coupons from the database based on dynamic filtering
    const coupons = await Coupon.find(filter);

    // Send the Coupons in the response
    res.status(200).json({ coupons });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Controller function for getting a single Coupon by ID
export const getCouponById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract Coupon ID from the request parameters
    const { id } = req.params;

    // Find the Coupon in the database based on the provided ID
    const coupon = await Coupon.findById(id);

    // Check if the Coupon exists
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }

    // Send the Coupon in the response
    res.status(200).json({ coupon });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for updating a Coupon by ID
export const updateCouponById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract Coupon ID from the request parameters
    const { id } = req.params;

    // Extract updated Coupon details from the request body
    const { name, discount_perc, from_date, to_date, forever, status } = req.body;

    // Find the Coupon in the database based on the provided ID
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      {
        name,
        discount_perc,
        from_date,
        to_date,
        forever,
        status,
      },
      { new: true } // Return the updated Coupon
    );

    // Check if the Coupon exists
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }

    // Send the updated Coupon in the response
    res.status(200).json({ message: 'Coupon updated successfully', coupon });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for deleting a Coupon by ID
export const deleteCouponById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract Coupon ID from the request parameters
    const { id } = req.params;

    // Find and delete the Coupon in the database based on the provided ID
    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    // Check if the Coupon exists
    if (!deletedCoupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }

    // Send a success response
    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
