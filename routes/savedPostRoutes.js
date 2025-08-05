import express from 'express';
import savedPostController from '../controllers/post/savedPostController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Save a post
router.post('/posts/:postId/save', savedPostController.savePost);

// Unsave a post
router.delete('/posts/:postId/save', savedPostController.unsavePost);

// Get user's saved posts
router.get('/saved-posts', savedPostController.getSavedPosts);

// Check if a post is saved by current user
router.get('/posts/:postId/saved', savedPostController.checkIfSaved);

export default router; 