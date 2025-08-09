import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import {
  getPublicChatRooms,
  createChatRoom,
  joinChatRoom,
  getChatRoomDetails,
  leaveChatRoom,
  getChatRoomMessages,
  getStatistics,
  deleteChatRoom
} from '../controllers/chatController.js';

const router = express.Router();

// Apply auth middleware to all chat routes
router.use(authMiddleware);

// Get public chat rooms
router.get('/rooms/public', getPublicChatRooms);

// Create a new chat room (public only, admin)
router.post('/rooms', adminMiddleware, createChatRoom);

// Join a chat room
router.post('/rooms/join', joinChatRoom);

// Get chat room details and messages
router.get('/rooms/:roomId', getChatRoomDetails);
router.get('/rooms/:roomId/messages', getChatRoomMessages);

// Leave a chat room
router.delete('/rooms/:roomId/leave', leaveChatRoom);

// Delete a chat room (admin only)
router.delete('/rooms/:roomId', adminMiddleware, deleteChatRoom);

// Get chat statistics
router.get('/statistics', getStatistics);

export default router;
