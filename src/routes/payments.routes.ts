import express from 'express';
import crypto from 'crypto'
import { razorpay } from '../payments/razorpay';
import Route from '../models/route.model';
import TaxiType from '../models/taxiType.model';
import axios from 'axios';
import Booking from '../models/booking.model';
import jwt, { JwtPayload } from 'jsonwebtoken';
import SingletonSettings from '../models/settings.model';
import Coupon, { ICoupon } from '../models/coupon.model';

// Create a router instance
const router = express.Router();

router.post("/orders", async (req, res) => {

    const { route_id, requested_taxi_type, payment, trip_type, pick_up_date, return_date, hourly_package, coupon_id } = req.body;

    console.log(req.body)

    try {

        let route

        // Fetch taxi type details
        const taxiType = await TaxiType.findById(requested_taxi_type);
        if (!taxiType) return res.status(400).json({ msg: "Invalid taxi type ID" });

        // Fetch settings
        const settingsResponse = await axios.get('http://0.0.0.0:5000/settings/get');
        const settings = settingsResponse.data;
        if (!settings) return res.status(500).json({ msg: "Settings not found" });


        // Calculate amount based on route and taxi type
        let distance = 0, amount = 0;

        if (trip_type === "Hourly Rental") {
            const [hours, _, kms, __] = hourly_package.split(' ').map((value: string) => parseInt(value));
            distance = kms; // For hourly rental, distance is based on kms
            amount = distance * taxiType.price_km;
        } else {
            // Fetch route details
            route = await Route.findById(route_id);
            if (!route) return res.status(400).json({ msg: "Invalid route ID" });

            if (trip_type === 'Round Trip') {
                const daysDifference = Math.ceil(((new Date(return_date) as any) - (new Date(pick_up_date) as any)) / (1000 * 60 * 60 * 24));
                distance = route?.round_trip_km || 0;
                amount = ((distance / 2) * (daysDifference + 1)) * taxiType.price_km;
            } else {
                distance =  route?.one_way_trip_km || 0;
                amount = distance * taxiType.price_km;
            }
        }

        // Apply discount if applicable
        const discountPercentage = taxiType.discount_percentage;
        if (discountPercentage > 0) {
            const discountAmount = (amount * discountPercentage) / 100;
            amount -= discountAmount;
        }

        // Apply advance payment percentage if payment type is advance
        if (payment === "advance") {
            amount = Math.round(amount * ((parseInt(settings?.advancePaymentPercentage || '0')) / 100));
        } else if (coupon_id) {
            // Apply coupon discount and round off the amount with no decimal values
            const coupon: ICoupon | null = await Coupon.findById(coupon_id);
            if (coupon) {
                const couponDiscount = Math.round((amount * coupon.discount_perc) / 100);
                amount -= couponDiscount;
            }
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

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT
        // THE PAYMENT IS LEGIT & VERIFIED
        // Now you can create the booking in your database
        const newBooking = new Booking({
            user_id: userId,
            route_id: booking.route_id,
            pickup_city: booking.pickup_city,
            hours_kms: booking.hourly_package,
            pick_up_date: booking.pick_up_date,
            pick_up_time: booking.pick_up_time,
            return_date: booking.return_date,
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
            ],
            coupon_id: booking.coupon_id,
            base_fare: booking.base_fare
            
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
