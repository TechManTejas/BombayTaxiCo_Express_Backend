import express from 'express';
import { getUserDetails, registerUser, signinUser } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';
import User from '../models/user.model';

// Create a router instance
const router = express.Router();

// Define routes
router.post('/register', registerUser);
router.post('/signin', signinUser);

router.use('/', generateCRUDRoutes(User));

// Protecteds route that requires authentication
// router.get('/', authenticateToken, getUserDetails);

// Export the router
export default router;
