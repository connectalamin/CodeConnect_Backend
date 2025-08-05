import prisma from '../DB/db.config.js';

// Middleware to check if user has verified their email
export const requireEmailVerification = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { isEmailVerified: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        error: 'Please verify your email before accessing this feature.',
        needsVerification: true
      });
    }

    next();
  } catch (error) {
    console.error('Email verification middleware error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Optional middleware to check email verification status
export const checkEmailVerification = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { isEmailVerified: true }
    });

    if (user) {
      req.userEmailVerified = user.isEmailVerified;
    }

    next();
  } catch (error) {
    console.error('Email verification check error:', error);
    // Don't block the request, just continue
    next();
  }
}; 