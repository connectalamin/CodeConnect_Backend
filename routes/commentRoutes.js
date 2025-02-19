import express from 'express';
import { createComment,getCommentsForPost,updateComment ,deleteComment,checkBestAnswer} from '../controllers/post/commentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router= express.Router()

router.post('/:id/comment',authMiddleware,createComment);
router.get('/:id/comment',getCommentsForPost);
router.patch('/comment/:commentId', authMiddleware, updateComment);
router.delete('/comment/:commentId', authMiddleware, deleteComment);

// Route to mark a comment as the best answer
router.patch('/comment/:commentId/best', authMiddleware, checkBestAnswer);

export default router;