import express from 'express';
import { signup, login,logout } from '../controllers/auth/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
const router = express.Router();

// Signup Route
router.post('/signup', signup);

// Login Route
router.post('/login', login);

router.post('/logout', authMiddleware, logout);



export default router;
