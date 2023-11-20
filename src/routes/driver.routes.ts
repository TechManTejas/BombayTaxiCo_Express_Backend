import express from 'express';
import * as driverController from '../controllers/driver.controller';

const router = express.Router();

// Routes
router.post('/', driverController.createDriver);
router.get('/', driverController.getAllDrivers);
router.get('/:id', driverController.getDriverById);
router.put('/:id', driverController.updateDriverById);
router.delete('/:id', driverController.deleteDriverById);

export default router;
