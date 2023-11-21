// Import necessary libraries and modules
import express from 'express';
import { createTo, getAllTos, getToById, updateToById, deleteToById } from '../controllers/to.controller';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';
import To from '../models/to.model';

// Create a router instance
const router = express.Router();

// Define routes
// router.post('/', createTo);
// router.get('/', getAllTos);
// router.get('/:id', getToById);
// router.put('/:id', updateToById);
// router.delete('/:id', deleteToById);

router.use('/', generateCRUDRoutes(To))

// Export the router
export default router;
