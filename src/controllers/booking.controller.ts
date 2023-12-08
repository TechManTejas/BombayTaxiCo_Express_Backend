// BookingController.ts
import { Request, Response } from 'express';
import Booking, { BookingStatus } from '../models/booking.model';
import Driver from '../models/driver.model';
import Taxi from '../models/taxi.model';

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

export const getBookingStatusCounts = async (req: Request, res: Response) => {
  try {
    // Use Mongoose aggregation to count documents based on booking_status
    const result = await Booking.aggregate([
      {
        $group: {
          _id: '$booking_status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Create a record object with booking_status as keys and count as values
    const statusCounts: Record<string, number> = {};
    let totalCount = 0;

    result.forEach((item: any) => {
      // Convert _id to string and assign count
      statusCounts[item._id.toString()] = item.count;
      totalCount += item.count;
    });

    // Include an "All" attribute with the total count
    statusCounts['All'] = totalCount;

    res.status(200).json(statusCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const assignTaxiDriver = async (req: Request, res: Response) => {
  const { booking_id, driver_id, taxi_id } = req.body;

  try {
    // Start a transaction
    const session = await Booking.startSession();
    session.startTransaction();

    try {
      // Assign driver_id and taxi_id to the booking object
      const updatedBooking = await Booking.findByIdAndUpdate(
        booking_id,
        { $set: { driver_id, taxi_id, booking_status: 'Confirmed' } },
        { new: true, session }
      );

      if (updatedBooking) {
        // Add the booking object to the assigned_trips of the driver
        await Driver.findByIdAndUpdate(driver_id, { $push: { assigned_trips: updatedBooking._id } }, { session });

        // Add the booking object to the assigned_trips of the taxi
        await Taxi.findByIdAndUpdate(taxi_id, { $push: { assigned_trips: updatedBooking._id } }, { session });

        // Change the status of the driver to 'Assigned'
        await Driver.findByIdAndUpdate(driver_id, { $set: { driver_status: 'Assigned' } }, { session });

        // Change the status of the taxi to 'Assigned'
        await Taxi.findByIdAndUpdate(taxi_id, { $set: { taxi_status: 'Assigned' } }, { session });
      }

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      // Send success response
      res.status(200).json({ message: 'Assignment successful, Booking Confirm' });
    } catch (error) {
      // Rollback the transaction on error
      await session.abortTransaction();
      session.endSession();

      console.error('Error:', error);
      res.status(500).json({ message: 'Error assigning taxi and driver' });
    }
  } catch (error) {
    console.error('Error starting transaction:', error);
    res.status(500).json({ message: 'Error starting transaction' });
  }
};

export const startTrip = async (req: Request, res: Response) => {
  const { booking_id } = req.body;

  try {
    // Start a transaction
    const session = await Booking.startSession();
    session.startTransaction();

    try {
      // Find the booking
      const booking = await Booking.findById(booking_id).session(session);

      if (booking) {
        // Update booking status to "On Ride"
        await booking.updateOne({ $set: { booking_status: 'On Ride' } }).session(session);

        // Update taxi status to "On a Trip" and remove the booking from assigned_trips
        await Taxi.findByIdAndUpdate(
          booking.taxi_id,
          {
            $set: { taxi_status: 'On a Trip', current_trip: booking._id },
            $pull: { assigned_trips: booking._id }
          },
          { session }
        );

        // Update driver status to "On a Trip" and remove the booking from assigned_trips
        await Driver.findByIdAndUpdate(
          booking.driver_id,
          {
            $set: { driver_status: 'On a Trip', current_trip: booking._id },
            $pull: { assigned_trips: booking._id }
          },
          { session }
        );

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Send success response
        res.status(200).json({ message: 'Trip started successfully' });
      } else {
        // If the booking is not found
        res.status(404).json({ message: 'Booking not found' });
      }
    } catch (error) {
      // Rollback the transaction on error
      await session.abortTransaction();
      session.endSession();

      console.error('Error:', error);
      res.status(500).json({ message: 'Error starting trip' });
    }
  } catch (error) {
    console.error('Error starting transaction:', error);
    res.status(500).json({ message: 'Error starting transaction' });
  }
};

export const endTrip = async (req: Request, res: Response) => {
  const { booking_id } = req.body;

  try {
    // Start a transaction
    const session = await Booking.startSession();
    session.startTransaction();

    try {
      // Update booking status to "Completed" and remove current_trip
      const updatedBooking = await Booking.findByIdAndUpdate(
        booking_id,
        {
          $set: { booking_status: 'Completed' },
        },
        { new: true, session }
      );

      if (updatedBooking) {
        // Move current_trip to completed_trips in Driver and Taxi
        await Driver.findByIdAndUpdate(
          updatedBooking.driver_id,
          { $push: { completed_trips: updatedBooking } },
          { session }
        );

        await Taxi.findByIdAndUpdate(
          updatedBooking.taxi_id,
          { $push: { completed_trips: updatedBooking } },
          { session }
        );

        // Clear current_trip from Driver and Taxi
        await Driver.findByIdAndUpdate(
          updatedBooking.driver_id,
          { $set: { current_trip: null } },
          { session }
        );

        await Taxi.findByIdAndUpdate(
          updatedBooking.taxi_id,
          { $set: { current_trip: null } },
          { session }
        );

        // Check if assigned_trips are empty for Driver and Taxi
        const driver = await Driver.findById(updatedBooking.driver_id).session(session);
        const taxi = await Taxi.findById(updatedBooking.taxi_id).session(session);

        if (driver) {
          if (driver.assigned_trips.length === 0) {
            // If assigned_trips are empty, make driver status Available
            await Driver.findByIdAndUpdate(driver._id, { $set: { driver_status: 'Available' } }, { session });
          } else {
            // If assigned_trips are not empty, make driver status Assigned
            await Driver.findByIdAndUpdate(driver._id, { $set: { driver_status: 'Assigned' } }, { session });
          }
        }

        if (taxi) {
          if (taxi.assigned_trips.length === 0) {
            // If assigned_trips are empty, make taxi status Available
            await Taxi.findByIdAndUpdate(taxi._id, { $set: { taxi_status: 'Available' } }, { session });
          } else {
            // If assigned_trips are not empty, make taxi status Assigned
            await Taxi.findByIdAndUpdate(taxi._id, { $set: { taxi_status: 'Assigned' } }, { session });
          }
        }
      }

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      // Send success response
      res.status(200).json({ message: 'Trip ended successfully' });
    } catch (error) {
      // Rollback the transaction on error
      await session.abortTransaction();
      session.endSession();

      console.error('Error:', error);
      res.status(500).json({ message: 'Error ending trip' });
    }
  } catch (error) {
    console.error('Error starting transaction:', error);
    res.status(500).json({ message: 'Error starting transaction' });
  }
};