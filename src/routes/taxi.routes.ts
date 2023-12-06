// Import necessary libraries and modules
import express from 'express';
import * as taxiController from '../controllers/taxi.controller';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';
import Taxi from '../models/taxi.model';

// Create a router instance
const router = express.Router();

// Routes
// router.post('/', taxiController.createTaxi);
// router.get('/', taxiController.getAllTaxis);
// router.get('/:id', taxiController.getTaxiById);
// router.put('/:id', taxiController.updateTaxiById);
// router.delete('/:id', taxiController.deleteTaxiById);

router.use('/', generateCRUDRoutes(Taxi, ["taxi_type_id"]))

// Export the router
export default router;
