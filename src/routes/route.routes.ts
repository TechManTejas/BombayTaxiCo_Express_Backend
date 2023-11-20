import express from 'express';
import * as routeController from '../controllers/route.controller';

const router = express.Router();

// Routes
router.post('/', routeController.createRoute);
router.get('/', routeController.getAllRoutes);
router.get('/:id', routeController.getRouteById);
router.put('/:id', routeController.updateRouteById);
router.delete('/:id', routeController.deleteRouteById);

export default router;
