import express from 'express';
import { getUserDetails, registerUser, signinUser } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

// Create a router instance
const router = express.Router();

// Define routes
router.post('/register', registerUser);
router.post('/signin', signinUser);

// Protecteds route that requires authentication
router.get('/user/details', authenticateToken, getUserDetails);

// Export the router
export default router;
