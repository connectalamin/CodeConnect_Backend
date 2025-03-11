import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { deleteUser, getUsers } from '../controllers/admin/userManageController.js'; // Add getUsers import

const router = express.Router();

// Admin Routes
router.get("/", authMiddleware, adminMiddleware, getUsers); // New GET endpoint
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;