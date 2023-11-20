import express from 'express';
import * as taxiTypeController from '../controllers/taxiType.controller';

const router = express.Router();

// Routes
router.post('/', taxiTypeController.createTaxiType);
router.get('/', taxiTypeController.getAllTaxiTypes);
router.get('/:id', taxiTypeController.getTaxiTypeById);
router.put('/:id', taxiTypeController.updateTaxiTypeById);
router.delete('/:id', taxiTypeController.deleteTaxiTypeById);

export default router;
