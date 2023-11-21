// Import necessary libraries and modules
import express from 'express';
import { createFAQ, getAllFAQs, getFAQById, updateFAQById, deleteFAQById } from '../controllers/faq.controller';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';
import FAQ from '../models/faq.model';

// Create a router instance
const router = express.Router();

// Define routes
// router.post('/', createFAQ);
// router.get('/', getAllFAQs);
// router.get('/:id', getFAQById);
// router.put('/:id', updateFAQById);
// router.delete('/:id', deleteFAQById);

router.use('/', generateCRUDRoutes(FAQ))

// Export the router
export default router;
