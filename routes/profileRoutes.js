import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/profile/profileController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);


router.patch('/profile', authMiddleware, updateUserProfile);

export default router;