// Import necessary libraries and modules
import express from 'express';
import { createFrom, getAllFroms, getFromById, updateFromById, deleteFromById } from '../controllers/from.controller';

// Create a router instance
const router = express.Router();

// Define routes
router.post('/', createFrom);
router.get('/', getAllFroms);
router.get('/:id', getFromById);
router.put('/:id', updateFromById);
router.delete('/:id', deleteFromById);

// Export the router
export default router;
