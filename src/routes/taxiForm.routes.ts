// Import necessary libraries and modules
import express from 'express';
import { postTaxiForm, getAllTaxiForms } from '../controllers/taxiForm.controller';

// Create a router instance
const router = express.Router();

// Define routes
router.post('/', postTaxiForm);
router.get('/', getAllTaxiForms);

// Export the router
export default router;
