// Import necessary libraries and modules
import express from 'express';
import { createFAQ, getAllFAQs, getFAQById, updateFAQById, deleteFAQById } from '../controllers/faq.controller';

// Create a router instance
const router = express.Router();

// Define routes
router.post('/', createFAQ);
router.get('/', getAllFAQs);
router.get('/:id', getFAQById);
router.put('/:id', updateFAQById);
router.delete('/:id', deleteFAQById);

// Export the router
export default router;
