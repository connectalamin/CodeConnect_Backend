import express from 'express';
import { createOrUpdateVote } from '../controllers/post/voteController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected Route: Upvote/Downvote a Post or Comment
router.post('/votes', authMiddleware, createOrUpdateVote);

export default router;