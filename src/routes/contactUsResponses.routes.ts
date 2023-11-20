// Import necessary libraries and modules
import express from 'express';
import { postContactUsResponse, getAllContactUsResponses } from '../controllers/contactUsResponses.controller';

// Create a router instance
const router = express.Router();

// Define routes
router.post('/', postContactUsResponse);
router.get('/', getAllContactUsResponses);

// Export the router
export default router;
