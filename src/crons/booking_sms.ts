import cron from "node-cron";
import Booking, { IBooking } from "../models/booking.model";
import User, { IUser } from "../models/user.model";
import { ITaxi } from "../models/taxi.model";
import { IDriver } from "../models/driver.model";
import { client } from "../twilio/client";
import { sendEmail } from "../email/sendEmail";
import rideDetails from "../email/rideDetails";

const startBookingSMSCron = () => {
  cron.schedule("*/5 * * * * *", async () => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const bookingsToday: IBooking[] = await Booking.find({
        notified: false,
        pick_up_date: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      })
        .populate("user_id")
        .populate("taxi_id")
        .populate("driver_id")
        .exec();

      // Filter bookings based on pick_up_time
      const currentTime = new Date();
      const filteredBookingsToday = bookingsToday.filter((booking) => {
        // Extract hours, minutes, and period (AM/PM) from pick_up_time
        const timeComponents =
          booking.pick_up_time.match(/(\d+):(\d+) (AM|PM)/);

        if (timeComponents) {
          let hours = parseInt(timeComponents[1]);
          const minutes = parseInt(timeComponents[2]);
          const period = timeComponents[3];

          // Adjust hours for PM
          if (period === "PM" && hours !== 12) {
            hours += 12;
          }

          const pickupTime = new Date();
          pickupTime.setHours(hours, minutes, 0, 0);

          // Calculate the pickupTime - 2 hours
          const twoHoursAgo = new Date(
            pickupTime.getTime() - 2 * 60 * 60 * 1000
          );

          // Check if the pickupTime is greater than current time and pickupTime - 2 hours is less than current time
          return pickupTime > currentTime && twoHoursAgo <= currentTime;
        }

        return false;
      });

      console.log(filteredBookingsToday);

      // Log information for each booking
      filteredBookingsToday.forEach(async (booking) => {
        const user: IUser | null = booking.user_id as unknown as IUser;
        const taxi: ITaxi | null = booking.taxi_id as unknown as ITaxi;
        const driver: IDriver | null = booking.driver_id as unknown as IDriver;

        // console.log('Booking Information:');
        // console.log('User:', user?.name, user?.email_id, user?.mobile_no);
        // console.log('Taxi:', taxi?.taxi_no);
        // console.log('Driver:', driver?.name, driver?.mobile_no);

        let message =
          `Bombay Taxi Co.™️\n\n` +
          `ᴅᴇᴀʀ ᴄᴜꜱᴛᴏᴍᴇʀ,\n\n` +
          `Thank You For Choosing Bombay Taxi Company !\n\n` +
          `ᴄᴀʙ & ᴅʀɪᴠᴇʀ ᴅᴇᴛᴀɪʟꜱ,\n\n` +
          `Cab Type: ${taxi?.taxi_type_id.name || "N/A"}\n` +
          `Cab No.: ${taxi?.taxi_no || "N/A"}\n` +
          `Drive Name: ${driver?.name || "N/A"}\n` +
          `Contact No.: ${driver?.mobile_no || "N/A"}\n\n` +
          `Wish You A Safe & Happy Journey !\n\n` +
          `FOR ANY QUERY OR ASSISTANCE CALL\n\n` +
          `Bombay Taxi Co. Customer Support\n` +
          `📱 +91 62627 44744 (24x7)\n` +
          `📧 bombaytaxicompany@gmail.com\n` +
          `🌐 www.bombaytaxicompany.com`;

        console.log(message);

        try {
          await client.messages.create({
            body: message,
            from: "+13303574214",
            to: `+91${user?.mobile_no}`,
          });
        } catch (twilioError) {
          console.error("Error sending SMS via Twilio:", twilioError);
        }

        const bookingDetails = {
          taxi: taxi,
          driver: driver,
        };

        // Send Email
        if (user) {
          try {
            await sendEmail({
              to: user.email_id,
              subject: "Your Ride Details",
              message: rideDetails(bookingDetails),
            });
          } catch (emailError) {
            console.error("Error sending email:", emailError);
          }
        }

        // Set the notified attribute to true for the booked object
        booking.notified = true;
        await booking.save();
      });
    } catch (error) {
      console.error("Error in the booking notification system:", error);
    }
  });
};

export default startBookingSMSCron;
