// BookingController.ts
import { Request, Response } from "express";
import Booking, { BookingStatus, TripType } from "../models/booking.model";
import Driver from "../models/driver.model";
import Taxi from "../models/taxi.model";
import jwt from "jsonwebtoken";
import mongoose, { Query } from "mongoose";
import { sendEmail } from "../email/sendEmail";
import confirmationEmail from "../email/confirmation";
import rideDetails from "../email/rideDetails";
import reassign from "../email/reassign";

// Function to get bookings associated with the user with pagination, search, and filter
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    // Extract the token from the request headers
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Decode the token to get user information
    const decodedToken: any = jwt.verify(
      token,
      `${process.env.JWT_SECRET_KEY}`
    ); // Replace 'your_secret_key' with your actual secret key

    // Get user ID from decoded token
    const userId = decodedToken.userId;

    // Pagination
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize as string, 10)
      : 10;
    const skip = (page - 1) * pageSize;

    // Filter (customize this based on your model's properties)
    const filterQuery: any = req.query.filter;
    const filter = filterQuery ? JSON.parse(filterQuery) : {};

    // Search
    const searchQuery = req.query.search as string;
    const searchFilter: Record<string, any> = {};

    if (searchQuery) {
      const modelProperties = Object.keys(Booking.schema.paths); // Assuming 'Booking' is the model for bookings

      const orArray = modelProperties
        .filter((property) => {
          const propertyType = Booking.schema.paths[property]?.instance;
          return propertyType === "String";
        })
        .map((property) => {
          const regexFilter = {
            [property]: { $regex: new RegExp(searchQuery, "i") },
          };
          return regexFilter;
        });

      // Add the $or array to the search filter
      searchFilter.$or = orArray;
    }

    const populateOptions = [
      { path: "route_id", populate: { path: "from_id to_id" } },
      { path: "user_id" },
      { path: "driver_id" },
      { path: "pickup_city" },
      { path: "taxi_id", populate: { path: "taxi_type_id" } },
      { path: "coupon_id" },
      { path: "requested_taxi_type" },
    ];

    const populationQuery = populateOptions.map((option) => ({
      path: option.path,
      populate: option.populate,
    }));

    const query = { user_id: userId, ...filter, ...searchFilter };

    const itemsQuery = Booking.find(query)
      .lean()
      .populate(populationQuery) as Query<any[], any, {}>;

    const totalCount = await Booking.countDocuments(query);

    const items = await itemsQuery
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings: items, total: totalCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserBookingStatusCounts = async (
  req: Request,
  res: Response
) => {
  try {
    // Extract the token from the request headers
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Decode the token to get user information
    const decodedToken: any = jwt.verify(
      token,
      `${process.env.JWT_SECRET_KEY}`
    );

    // Get user ID from decoded token
    const userId = decodedToken.userId;

    // Use Mongoose aggregation to count documents based on booking_status for the specific user
    const result = await Booking.aggregate([
      {
        $match: { user_id: new mongoose.Types.ObjectId(userId) },
      },
      {
        $group: {
          _id: "$booking_status",
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
    statusCounts["All"] = totalCount;

    res.status(200).json(statusCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getBookingStatusCounts = async (req: Request, res: Response) => {
  try {
    // Use Mongoose aggregation to count documents based on booking_status
    const result = await Booking.aggregate([
      {
        $group: {
          _id: "$booking_status",
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
    statusCounts["All"] = totalCount;

    res.status(200).json(statusCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
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
        { $set: { driver_id, taxi_id, booking_status: "Confirmed" } },
        { new: true, session }
      )
        .populate({
          path: "taxi_id",
          populate: { path: "taxi_type_id", select: "name" },
        })
        .populate({
          path: "route_id",
          populate: [
            { path: "from_id", select: "name -_id" },
            { path: "to_id", select: "name -_id" },
          ],
        })
        .populate("user_id");

      if (updatedBooking) {
        // Add the booking object to the assigned_trips of the driver
        await Driver.findByIdAndUpdate(
          driver_id,
          { $push: { assigned_trips: updatedBooking._id } },
          { session }
        );

        // Add the booking object to the assigned_trips of the taxi
        await Taxi.findByIdAndUpdate(
          taxi_id,
          { $push: { assigned_trips: updatedBooking._id } },
          { session }
        );

        // Change the status of the driver to 'Assigned'
        await Driver.findByIdAndUpdate(
          driver_id,
          { $set: { driver_status: "Assigned" } },
          { session }
        );

        // Change the status of the taxi to 'Assigned'
        await Taxi.findByIdAndUpdate(
          taxi_id,
          { $set: { taxi_status: "Assigned" } },
          { session }
        );

        let route = "";
        if (updatedBooking.trip_type === TripType.OneWay) {
          route =
            updatedBooking.route_id?.from_id.name +
            " → " +
            updatedBooking.route_id?.to_id.name;
        } else if (updatedBooking.trip_type === TripType.Round) {
          route =
            updatedBooking.route_id?.from_id.name +
            " → " +
            updatedBooking.route_id?.to_id.name +
            " → " +
            updatedBooking.route_id?.from_id.name;
        } else {
          route = updatedBooking.route_id?.from_id.name + " → ";
        }

        // Send the confirmation email
        const bookingDetails = {
          trip_type: updatedBooking.trip_type,
          journey: route,
          taxi: updatedBooking?.taxi_id?.taxi_type_id.name,
          pickup_address: updatedBooking.pickup_address,
          drop_address: updatedBooking.drop_address ?? "-",
          pick_up_date: updatedBooking.pick_up_date,
          pick_up_time: updatedBooking.pick_up_time,
          return_date: updatedBooking.return_date,
        };

        const emailHtmlContent = confirmationEmail(bookingDetails);
        await sendEmail({
          to: updatedBooking.user_id.email_id,
          subject: "Your Taxi Booking is Confirmed",
          message: emailHtmlContent,
        });
      }

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      // Send success response
      res
        .status(200)
        .json({ message: "Assignment successful, Booking Confirm" });
    } catch (error) {
      // Rollback the transaction on error
      await session.abortTransaction();
      session.endSession();

      console.error("Error:", error);
      res.status(500).json({ message: "Error assigning taxi and driver" });
    }
  } catch (error) {
    console.error("Error starting transaction:", error);
    res.status(500).json({ message: "Error starting transaction" });
  }
};

export const reassignTaxiDriver = async (req: Request, res: Response) => {
  const { booking_id, driver_id, taxi_id } = req.body;

  console.log(req.body);

  try {
    // Start a transaction
    const session = await Booking.startSession();
    session.startTransaction();

    try {
      // Retrieve current booking with existing driver and taxi
      const currentBooking = await Booking.findById(booking_id).session(
        session
      );

      const currentDriverId = currentBooking?.driver_id;
      const currentTaxiId = currentBooking?.taxi_id;

      // Assign driver_id and taxi_id to the booking object
      const updatedBooking = await Booking.findByIdAndUpdate(
        booking_id,
        { $set: { driver_id, taxi_id, booking_status: "Confirmed" } },
        { new: true, session }
      )
        .populate({
          path: "taxi_id",
          populate: { path: "taxi_type_id", select: "name" },
        })
        .populate(
         "driver_id",
        )
        .populate({
          path: "route_id",
          populate: [
            { path: "from_id", select: "name -_id" },
            { path: "to_id", select: "name -_id" },
          ],
        })
        .populate("user_id");

      if (updatedBooking) {
        // Remove booking from previously assigned driver and check remaining trips
        const oldDriver = await Driver.findByIdAndUpdate(
          currentDriverId,
          { $pull: { assigned_trips: booking_id } },
          { new: true, session }
        );

        // Remove booking from previously assigned taxi and check remaining trips
        const oldTaxi = await Taxi.findByIdAndUpdate(
          currentTaxiId,
          { $pull: { assigned_trips: booking_id } },
          { new: true, session }
        );

        // Add booking to new driver's assigned trips
        await Driver.findByIdAndUpdate(
          driver_id,
          { $push: { assigned_trips: booking_id } },
          { session }
        );

        // Add booking to new taxi's assigned trips
        await Taxi.findByIdAndUpdate(
          taxi_id,
          { $push: { assigned_trips: booking_id } },
          { session }
        );

        // Update the status of the old driver and taxi if they have no more assigned trips
        if (oldDriver?.assigned_trips.length === 0) {
          await Driver.findByIdAndUpdate(
            currentDriverId,
            { $set: { driver_status: "Available" } },
            { session }
          );
        }

        if (oldTaxi?.assigned_trips.length === 0) {
          await Taxi.findByIdAndUpdate(
            currentTaxiId,
            { $set: { taxi_status: "Available" } },
            { session }
          );
        }

        // Update the status of the new driver and taxi to "Assigned"
        await Driver.findByIdAndUpdate(
          driver_id,
          { $set: { driver_status: "Assigned" } },
          { session }
        );

        await Taxi.findByIdAndUpdate(
          taxi_id,
          { $set: { taxi_status: "Assigned" } },
          { session }
        );

        let route = "";
        if (updatedBooking.trip_type === TripType.OneWay) {
          route =
            updatedBooking.route_id?.from_id.name +
            " → " +
            updatedBooking.route_id?.to_id.name;
        } else if (updatedBooking.trip_type === TripType.Round) {
          route =
            updatedBooking.route_id?.from_id.name +
            " → " +
            updatedBooking.route_id?.to_id.name +
            " → " +
            updatedBooking.route_id?.from_id.name;
        } else {
          route = updatedBooking.route_id?.from_id.name + " → ";
        }

        // Send the confirmation email
        const bookingDetails = {
          trip_type: updatedBooking.trip_type,
          journey: route,
          taxi: updatedBooking?.taxi_id?.taxi_type_id.name,
          pickup_address: updatedBooking.pickup_address,
          drop_address: updatedBooking.drop_address ?? "-",
          pick_up_date: updatedBooking.pick_up_date,
          pick_up_time: updatedBooking.pick_up_time,
          return_date: updatedBooking.return_date,
        };

        const emailHtmlContent = confirmationEmail(bookingDetails);
        await sendEmail({
          to: updatedBooking.user_id.email_id,
          subject: "Your Taxi Booking is Confirmed",
          message: emailHtmlContent,
        });
      }

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      const bookingDetails = {
        taxi: updatedBooking?.taxi_id,
        driver: updatedBooking?.driver_id,
      };

      // Send Email
      // await sendEmail({
      //   to: updatedBooking?.user_id?.email_id,
      //   subject: "Your New Ride Details",
      //   message: reassign(bookingDetails),
      // });

      // Send success response
      res
        .status(200)
        .json({ message: "Assignment successful, Booking Confirm" });
    } catch (error) {
      // Rollback the transaction on error
      await session.abortTransaction();
      session.endSession();

      console.error("Error:", error);
      res.status(500).json({ message: "Error assigning taxi and driver" });
    }
  } catch (error) {
    console.error("Error starting transaction:", error);
    res.status(500).json({ message: "Error starting transaction" });
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
        await booking
          .updateOne({ $set: { booking_status: "On Ride" } })
          .session(session);

        // Update taxi status to "On a Trip" and remove the booking from assigned_trips
        await Taxi.findByIdAndUpdate(
          booking.taxi_id,
          {
            $set: { taxi_status: "On a Trip", current_trip: booking._id },
            $pull: { assigned_trips: booking._id },
          },
          { session }
        );

        // Update driver status to "On a Trip" and remove the booking from assigned_trips
        await Driver.findByIdAndUpdate(
          booking.driver_id,
          {
            $set: { driver_status: "On a Trip", current_trip: booking._id },
            $pull: { assigned_trips: booking._id },
          },
          { session }
        );

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Send success response
        res.status(200).json({ message: "Trip started successfully" });
      } else {
        // If the booking is not found
        res.status(404).json({ message: "Booking not found" });
      }
    } catch (error) {
      // Rollback the transaction on error
      await session.abortTransaction();
      session.endSession();

      console.error("Error:", error);
      res.status(500).json({ message: "Error starting trip" });
    }
  } catch (error) {
    console.error("Error starting transaction:", error);
    res.status(500).json({ message: "Error starting transaction" });
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
          $set: { booking_status: "Completed" },
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
        const driver = await Driver.findById(updatedBooking.driver_id).session(
          session
        );
        const taxi = await Taxi.findById(updatedBooking.taxi_id).session(
          session
        );

        if (driver) {
          if (driver.assigned_trips.length === 0) {
            // If assigned_trips are empty, make driver status Available
            await Driver.findByIdAndUpdate(
              driver._id,
              { $set: { driver_status: "Available" } },
              { session }
            );
          } else {
            // If assigned_trips are not empty, make driver status Assigned
            await Driver.findByIdAndUpdate(
              driver._id,
              { $set: { driver_status: "Assigned" } },
              { session }
            );
          }
        }

        if (taxi) {
          if (taxi.assigned_trips.length === 0) {
            // If assigned_trips are empty, make taxi status Available
            await Taxi.findByIdAndUpdate(
              taxi._id,
              { $set: { taxi_status: "Available" } },
              { session }
            );
          } else {
            // If assigned_trips are not empty, make taxi status Assigned
            await Taxi.findByIdAndUpdate(
              taxi._id,
              { $set: { taxi_status: "Assigned" } },
              { session }
            );
          }
        }
      }

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      // Send success response
      res.status(200).json({ message: "Trip ended successfully" });
    } catch (error) {
      // Rollback the transaction on error
      await session.abortTransaction();
      session.endSession();

      console.error("Error:", error);
      res.status(500).json({ message: "Error ending trip" });
    }
  } catch (error) {
    console.error("Error starting transaction:", error);
    res.status(500).json({ message: "Error starting transaction" });
  }
};
