// Import necessary libraries and modules
import express from 'express';
import Price from '../models/price.model';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';

// Create a router instance
const router = express.Router();

router.use('/', generateCRUDRoutes(Price));
  

// Export the router
export default router;
