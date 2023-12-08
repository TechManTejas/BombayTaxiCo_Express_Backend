// Import necessary libraries and modules
import express from 'express';
import * as driverController from '../controllers/driver.controller';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';
import Driver from '../models/driver.model';


// Create a router instance
const router = express.Router();

// Routes
// router.post('/', driverController.createDriver);
// router.get('/', driverController.getAllDrivers);
// router.get('/:id', driverController.getDriverById);
// router.put('/:id', driverController.updateDriverById);
// router.delete('/:id', driverController.deleteDriverById);

router.use('/', generateCRUDRoutes(Driver, [
    {
        path: 'assigned_trips',
        populate: {
            path: 'route_id',
            populate: {
                path: 'from_id to_id'
            }
        }
    },
]))

// Export the router
export default router;
