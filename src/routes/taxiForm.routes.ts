// Import necessary libraries and modules
import express from 'express';
import { postTaxiForm, getAllTaxiForms } from '../controllers/taxiForm.controller';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';
import TaxiForm from '../models/taxiForm.model';

// Create a router instance
const router = express.Router();

// Define routes
// router.post('/', postTaxiForm);
// router.get('/', getAllTaxiForms);

router.use('/', generateCRUDRoutes(TaxiForm))

// Export the router
export default router;
