import express from 'express';
import { 
  signup, 
  login, 
  logout, 
  verifyEmail, 
  resendVerificationEmail, 
  forgotPassword, 
  resetPassword 
} from '../controllers/auth/userController.js';
import { sendVerificationEmail, generateVerificationToken } from '../utils/emailService.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
const router = express.Router();

// Test email endpoint (remove this in production)
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    console.log('🧪 Testing email service with:', { email });
    const testToken = generateVerificationToken();
    const result = await sendVerificationEmail(email, 'Test User', testToken);
    console.log('🧪 Test email result:', result);
    
    res.json({ 
      message: 'Test email sent', 
      success: result.success,
      error: result.error || null,
      details: result
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Signup Route
router.post('/signup', signup);

// Login Route
router.post('/login', login);

// Email Verification Routes (support both /verify-email?token= and /verify-email/:token)
router.get('/verify-email', verifyEmail); // query param style
router.get('/verify-email/:token', verifyEmail); // path param style
router.post('/resend-verification', resendVerificationEmail);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Logout Route
router.post('/logout', authMiddleware, logout);

export default router;
