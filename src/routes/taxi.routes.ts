import express from 'express';
import * as taxiController from '../controllers/taxi.controller';

const router = express.Router();

// Routes
router.post('/', taxiController.createTaxi);
router.get('/', taxiController.getAllTaxis);
router.get('/:id', taxiController.getTaxiById);
router.put('/:id', taxiController.updateTaxiById);
router.delete('/:id', taxiController.deleteTaxiById);

export default router;
