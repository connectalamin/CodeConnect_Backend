import express from 'express';
import { 
  getLeaderboard, 
  getUserPosition, 
  getLeaderboardByMetric, 
  getLeaderboardStats 
} from '../controllers/leaderboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get main leaderboard with pagination and timeframe filtering
// Query params: limit, offset, timeframe (all/week/month/year)
router.get('/', getLeaderboard);

// Get leaderboard by specific metric (karma/posts/comments)
// Query params: metric, limit, offset
router.get('/by-metric', getLeaderboardByMetric);

// Get leaderboard summary stats
router.get('/stats', getLeaderboardStats);

// Get specific user's position in leaderboard (requires authentication)
router.get('/user/:userId', authMiddleware, getUserPosition);

// Get current user's position (requires authentication)
router.get('/me', authMiddleware, async (req, res) => {
  req.params.userId = req.userId.toString();
  return getUserPosition(req, res);
});

export default router;
