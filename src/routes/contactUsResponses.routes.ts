// Import necessary libraries and modules
import express from 'express';
import { postContactUsResponse, getAllContactUsResponses } from '../controllers/contactUsResponses.controller';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';
import ContactUsResponses from '../models/contactUsResponses.model';

// Create a router instance
const router = express.Router();

// Define routes
// router.post('/', postContactUsResponse);
// router.get('/', getAllContactUsResponses);

// Use generateCRUDRoutes to include CRUD routes
router.use('/', generateCRUDRoutes(ContactUsResponses));

// Export the router
export default router;
