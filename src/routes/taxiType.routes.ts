// Import necessary libraries and modules
import express from 'express';
import * as taxiTypeController from '../controllers/taxiType.controller';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';
import TaxiType from '../models/taxiType.model';

// Create a router instance
const router = express.Router();

// Routes
// router.post('/', taxiTypeController.createTaxiType);
// router.get('/', taxiTypeController.getAllTaxiTypes);
// router.get('/:id', taxiTypeController.getTaxiTypeById);
// router.put('/:id', taxiTypeController.updateTaxiTypeById);
// router.delete('/:id', taxiTypeController.deleteTaxiTypeById);

router.use('/', generateCRUDRoutes(TaxiType))

// Export the router
export default router;
