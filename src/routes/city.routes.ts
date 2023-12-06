// Import necessary libraries and modules
import express from 'express';
import { createFrom, getAllCitys, getCityById, updateCityById, deleteCityById } from '../controllers/city.controller';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';
import City from '../models/city.model';

// Create a router instance
const router = express.Router();

// Define routes
// router.post('/', createFrom);
// router.get('/', getAllFroms);
// router.get('/:id', getFromById);
// router.put('/:id', updateFromById);
// router.delete('/:id', deleteFromById);

router.use('/', generateCRUDRoutes(City))

// Export the router
export default router;
