// BookingController.ts
import { Request, Response } from 'express';
import Booking from '../models/booking.model';

// Create booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json({ message: 'Booking created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Read all bookings
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Read booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    res.status(200).json({ booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update booking by ID
export const updateBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedBooking = await Booking.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedBooking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    res.status(200).json({ message: 'Booking updated successfully', booking: updatedBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete booking by ID
export const deleteBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
