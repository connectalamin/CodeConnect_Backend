import express from 'express';
import { createComment } from '../controllers/post/commentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router= express.Router()

router.post('/comment/:id',authMiddleware,createComment);

export default router;