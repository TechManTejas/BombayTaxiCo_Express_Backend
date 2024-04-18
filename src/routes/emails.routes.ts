// Import necessary libraries and modules
import express from "express";
import multer from "multer";
import { sendEmail, sendEmailWithAttachments } from "../email/sendEmail";
import invoice from "../email/invoice";
import { IBooking, TripType } from "../models/booking.model";
import cancelRide from "../email/cancelRide";

const upload = multer({ dest: "uploads/invoices/" });

// Create a router instance
const router = express.Router();

router.post("/send-email-contact", async (req, res) => {
  try {
    await sendEmail({
      to: "bombaytaxicompany@gmail.com",
      subject: req.body.subject,
      message: req.body.message,
    });
    res.send({ message: "Email sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to send email." });
  }
});

router.post("/send-email-attach-taxi", async (req, res) => {
  try {
    await sendEmail({
      to: "bombaytaxicompany@gmail.com",
      subject: req.body.subject,
      message: req.body.message,
    });
    res.send({ message: "Email sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to send email." });
  }
});

router.post("/send-email-cancel-ride", async (req, res) => {
  // Assuming the email address is sent in the request body
  const booking: IBooking = req.body.booking;

  let route = "";
  if (booking.trip_type === TripType.OneWay) {
    route =
      booking.route_id?.from_id.name + " → " + booking.route_id?.to_id.name;
  } else if (booking.trip_type === TripType.Round) {
    route =
      booking.route_id?.from_id.name +
      " → " +
      booking.route_id?.to_id.name +
      " → " +
      booking.route_id?.from_id.name;
  } else {
    route = booking.route_id?.from_id.name + " → ";
  }

  // Send the confirmation email
  const bookingDetails = {
    journey: route,
    pick_up_date: booking.pick_up_date,
    pick_up_time: booking.pick_up_time,
  };

  try {
    await sendEmail({
      to: booking.user_id.email_id,
      subject: "Ride Cancellation",
      message: cancelRide(bookingDetails),
    });
    res.send({ message: "Email sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to send email." });
  }
});

router.post(
  "/send-email-invoice",
  upload.single("invoice"),
  async (req, res) => {
    // Assuming the email address is sent in the request body
    const emailAddress = req.body.email;

    try {
      await sendEmailWithAttachments({
        to: emailAddress,
        subject: "Your Invoice",
        message: invoice(),
        attachment: req?.file?.path,
      });
      res.send({ message: "Email sent successfully with attachment." });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ message: "Failed to send email with attachment." });
    }
  }
);

// Export the router
export default router;
