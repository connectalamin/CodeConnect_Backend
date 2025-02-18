import express from 'express';
import { createPost, getAllPosts, getPostById ,updatePost} from '../controllers/post/postController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected Route: Create a Question
router.post('/post', authMiddleware, createPost);

// Public Route: Get All Questions
router.get('/posts', getAllPosts);

// Public Route: Get a Single Question by ID
router.get('/post/:id', getPostById);

router.patch('/post/:id', authMiddleware, updatePost);

export default router;