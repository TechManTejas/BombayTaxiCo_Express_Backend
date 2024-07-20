// Import necessary libraries and modules
import express, { Request, Response } from 'express';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';
import Coupon, { ICoupon } from '../models/coupon.model';

// Create a router instance
const router = express.Router();

router.post('/apply-coupon', async (req: Request, res: Response) => {
    try {
        const { couponCode, amount } = req.body;

        // Check if the coupon exists
        const coupon: ICoupon | null = await Coupon.findOne({ name: couponCode });

        console.log(couponCode, amount, coupon);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Check if the coupon is active
        if (coupon.status !== 'Active') {
            return res.status(400).json({ message: 'Coupon is not active' });
        }

        const currentDate = new Date();

        // Check if the coupon is valid for the current date
        if (!coupon.forever && (currentDate < coupon.from_date || currentDate > coupon.to_date)) {
            return res.status(400).json({ message: 'Coupon is not valid at this time' });
        }

        // Apply the coupon logic here (modify as per your coupon logic)
        const discountedAmount: number = amount - Math.round((coupon.discount_perc / 100) * amount);

        // Send the discounted amount in the response
        return res.json({ discountedAmount, couponId: coupon._id });
    } catch (error) {
        console.error('Error applying coupon:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.use('/', generateCRUDRoutes(Coupon));

// Export the router
export default router;
