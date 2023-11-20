// Import necessary libraries and modules
import express from 'express';
import { createCoupon, getAllCoupons, getCouponById, updateCouponById, deleteCouponById } from '../controllers/coupon.controller';

// Create a router instance
const router = express.Router();

// Define routes
router.post('/', createCoupon);
router.get('/', getAllCoupons);
router.get('/:id', getCouponById);
router.put('/:id', updateCouponById);
router.delete('/:id', deleteCouponById);

// Export the router
export default router;
