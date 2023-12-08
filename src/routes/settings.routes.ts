import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';

const router = express.Router();

// Route to get singleton settings
router.get('/get', getSettings);

// Route to update singleton settings
router.put('/update', updateSettings);

export default router;
