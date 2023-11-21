// Import necessary libraries and modules
import express from 'express';
import { createCoupon, getAllCoupons, getCouponById, updateCouponById, deleteCouponById } from '../controllers/coupon.controller';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';
import Coupon from '../models/coupon.model';

// Create a router instance
const router = express.Router();

// Define routes
// router.post('/', createCoupon);
// router.get('/', getAllCoupons);
// router.get('/:id', getCouponById);
// router.put('/:id', updateCouponById);
// router.delete('/:id', deleteCouponById);

router.use('/', generateCRUDRoutes(Coupon))

// Export the router
export default router;
