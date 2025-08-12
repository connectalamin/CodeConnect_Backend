import express from 'express';
import { seedDatabase, clearDatabase } from '../controllers/admin/seedController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// Seed database endpoint (admin only)
router.post('/seed', adminMiddleware, seedDatabase);

// Clear database endpoint (admin only)
router.delete('/clear', adminMiddleware, clearDatabase);

export default router;
