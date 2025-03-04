import express from 'express';
import { getUserProfile, updateUserProfile,uploadMiddleware,getPublicUserProfile } from '../controllers/profile/profileController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);

router.patch('/profile', authMiddleware,uploadMiddleware, updateUserProfile);

router.get('/users/:id', getPublicUserProfile);

export default router;