import { Request, Response } from "express";
import cron from "node-cron";
import Booking from "../models/booking.model";
import { startTrip, endTrip } from "../controllers/booking.controller";

// Mock Response
const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};

  res.status = (code: number) => {
    console.log(`Status: ${code}`);
    return res as Response;
  };

  res.json = (body?: any) => {
    console.log("JSON response:", body);
    return res as Response;
  };

  return res;
};

export const startTripSMSCron = () => {
  cron.schedule("*/15 * * * *", async () => {
    try {
      const currentDate = new Date();

      // Fetch bookings that need to start the trip
      const bookingsToStart = await Booking.find({
        booking_status: "Confirmed",
        start_trip_time: { $lte: currentDate },
      });

      bookingsToStart.forEach(async (booking) => {
        try {
          const req = { body: { booking_id: booking._id } } as Request;
          const res = mockResponse() as Response;
          await startTrip(req, res);
          console.log(`Started trip for booking ID: ${booking._id}`);
        } catch (error) {
          console.error(`Error starting trip for booking ID: ${booking._id}`, error);
        }
      });
    } catch (error) {
      console.error("Error in startTripSMSCron:", error);
    }
  });
};

export const endTripSMSCron = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const bookingsToEnd = await Booking.find({
        booking_status: "On Ride",
        end_date: { $lte: twoDaysAgo },
      });

      bookingsToEnd.forEach(async (booking) => {
        try {
          const req = { body: { booking_id: booking._id } } as Request;
          const res = mockResponse() as Response;
          await endTrip(req, res);
          console.log(`Ended trip for booking ID: ${booking._id}`);
        } catch (error) {
          console.error(`Error ending trip for booking ID: ${booking._id}`, error);
        }
      });
    } catch (error) {
      console.error("Error in endTripSMSCron:", error);
    }
  });
};
