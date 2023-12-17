import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto'
import { razorpay } from '../payments/razorpay';
import Route from '../models/route.model';
import TaxiType from '../models/taxiType.model';
import axios from 'axios';
import Booking from '../models/booking.model';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Create a router instance
const router = express.Router();

router.post("/orders", async (req, res) => {

    const { route_id, requested_taxi_type, payment, trip_type, pickup_date, pickup_time, return_date } = req.body;

    console.log(req.body)

    try {

        // Fetch route details
        const route = await Route.findById(route_id);
        if (!route) return res.status(400).json({ msg: "Invalid route ID" });

        // Fetch taxi type details
        const taxiType = await TaxiType.findById(requested_taxi_type);
        if (!taxiType) return res.status(400).json({ msg: "Invalid taxi type ID" });

        // Fetch settings
        const settingsResponse = await axios.get('http://localhost:5000/settings/get');
        const settings = settingsResponse.data;

        if (!settings) return res.status(500).json({ msg: "Settings not found" });

        // Calculate amount based on route and taxi type
        const distance =
            trip_type === 'Round Trip'
                ? route?.round_trip_km || 0
                : trip_type === 'Hourly Rental'
                    ? 0
                    : route?.one_way_trip_km || 0;

        const pricePerKm = taxiType.price_km;
        const discountPercentage = taxiType.discount_percentage;

        let amount = distance * pricePerKm;

        // Apply discount if applicable
        if (discountPercentage > 0) {
            const discountAmount = (amount * discountPercentage) / 100;
            amount -= discountAmount;
        }

        // Apply advance payment percentage if payment type is advance
        if (payment === "advance") {
            amount = Math.round(amount * ((100 - parseInt(settings?.advancePaymentPercentage || '0')) / 100));
        }

        const options = {
            amount: amount * 100,
            currency: "INR"
        };

        const order = await razorpay.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post("/success", async (req, res) => {
    try {
        // getting the details back from our font-end
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
            booking
        } = req.body;

        console.log(req.body);

        const token = req.headers.authorization ?? ''

        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
        const shasum = crypto.createHmac("sha256", `${process.env.KEY_SECRET}`);

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        const digest = shasum.digest("hex");

        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: "Transaction not legit!" });

        // Decode the JWT token to get user information
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY || 'your_jwt_secret') as JwtPayload; // Replace 'your_jwt_secret' with your actual JWT secret
        const userId = decodedToken.userId;

        console.log(userId)

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT
        // THE PAYMENT IS LEGIT & VERIFIED
        // Now you can create the booking in your database
        const newBooking = new Booking({
            user_id: userId,
            route_id: booking.route_id,
            pick_up_date: booking.pick_up_date,
            pick_up_time: booking.pick_up_time,
            pickup_address: booking.pickup_address,
            drop_address: booking.drop_address,
            trip_type: booking.trip_type,
            requested_taxi_type: booking.requested_taxi_type,
            payments: [
                {
                    payment: booking.payment,
                    orderCreationId: orderCreationId,
                    razorpayPaymentId: razorpayPaymentId,
                    razorpayOrderId: razorpayOrderId,
                    razorpaySignature: razorpaySignature
                }
            ]
        });
        console.log(newBooking)

        // Save the booking to the database
        const savedBooking = await newBooking.save();

        res.json({
            msg: "success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            booking: savedBooking,
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Export the router
export default router;
