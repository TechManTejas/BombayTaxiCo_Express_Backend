// Import necessary libraries and modules
import express from 'express';
import { createTo, getAllTos, getToById, updateToById, deleteToById } from '../controllers/to.controller';

// Create a router instance
const router = express.Router();

// Define routes
router.post('/', createTo);
router.get('/', getAllTos);
router.get('/:id', getToById);
router.put('/:id', updateToById);
router.delete('/:id', deleteToById);

// Export the router
export default router;
