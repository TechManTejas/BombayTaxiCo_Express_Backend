import express from 'express';
import { generateFareQuote, getFareQuoteHealth } from '../controllers/fare-quote.controller';

const router = express.Router();

router.get('/health', getFareQuoteHealth);
router.post('/quote', generateFareQuote);

export default router;
