import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/admin/categoryController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// Routes for category management
router.get('/', getCategories);                            // Public access
router.post('/', authMiddleware, adminMiddleware, createCategory);    // Admin only
router.patch('/:id', authMiddleware, adminMiddleware, updateCategory); // Admin only
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory); // Admin only

export default router;