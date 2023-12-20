// Import necessary libraries and modules
import express, { Router } from 'express';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';
import Invoice from '../models/invoice.model';

// Create a router instance
const router: Router = express.Router();

router.use('/', generateCRUDRoutes(Invoice, [
    { path: 'booking' },
  ]));

// Export the router
export default router;
