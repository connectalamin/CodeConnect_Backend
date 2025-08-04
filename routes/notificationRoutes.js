import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences
} from '../controllers/post/notificationController.js';

const router = express.Router();

// Apply auth middleware to all notification routes
router.use(authMiddleware);

// Get user notifications
router.get('/', getUserNotifications);

// Mark notification as read
router.patch('/:notificationId/read', markNotificationAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllNotificationsAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

// Get notification preferences
router.get('/preferences', getNotificationPreferences);

// Update notification preferences
router.patch('/preferences', updateNotificationPreferences);

export default router; 