// Import necessary libraries and modules
import express from 'express';
import * as routeController from '../controllers/route.controller';
import Route from '../models/route.model';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';

// Create a router instance
const router = express.Router();

// Routes
// router.post('/', routeController.createRoute);
// router.get('/', routeController.getAllRoutes);
// router.get('/:id', routeController.getRouteById);
// router.put('/:id', routeController.updateRouteById);
// router.delete('/:id', routeController.deleteRouteById);

router.use('/', generateCRUDRoutes(Route, [
    { path: 'from_id' },
    { path: 'to_id' }
  ]));
  

// Export the router
export default router;
