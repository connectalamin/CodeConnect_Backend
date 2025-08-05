import prisma from '../../DB/db.config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateVerificationToken, generateResetToken, sendVerificationEmail, sendPasswordResetEmail } from '../../utils/emailService.js';

//  Password Strength Validation Function
const validatePassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

//  Signup Controller
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate Password Strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters long, include an uppercase letter, lowercase letter, a number, and a special character.',
      });
    }

    //  Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    //  Hash the password (Using 12 rounds for extra security)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    //  Create the user
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        isEmailVerified: false
      },
    });

    // Send verification email
    console.log('🚀 Attempting to send verification email for user:', email);
    const emailResult = await sendVerificationEmail(email, name, verificationToken);
    
    if (!emailResult.success) {
      // If email fails, still create user but log the error
      console.error('❌ Failed to send verification email:', {
        error: emailResult.error,
        details: emailResult.details,
        email: email,
        userId: user.id
      });
      
      // You might want to add this to a queue for retry later
      console.log('📝 User created but email failed. User can request resend later.');
    } else {
      console.log('✅ Verification email sent successfully!', {
        emailId: emailResult.emailId,
        email: email,
        userId: user.id
      });
    }

    res.status(201).json({ 
      message: 'User created successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

//  Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, // Include role in the token
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      message: 'Login successful', 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Verify Email Controller
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired verification token. Please request a new verification email.' 
      });
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    });

    res.json({ 
      success: true,
      message: 'Email verified successfully! You can now log in to your account.' 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Resend Verification Email Controller
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires
      }
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, user.name, verificationToken);
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }

    res.json({ 
      message: 'Verification email sent successfully. Please check your inbox.' 
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Forgot Password Controller
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      }
    });

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, user.name, resetToken);
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send password reset email. Please try again.' });
    }

    res.json({ 
      message: 'Password reset email sent successfully. Please check your inbox.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Reset Password Controller
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters long, include an uppercase letter, lowercase letter, a number, and a special character.',
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.json({ 
      message: 'Password reset successfully! You can now log in with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

//  Logout Controller
export const logout = async (req, res) => {
  try {
    
    res.json({ 
      message: 'Logged out successfully',
   
      expiresIn: new Date(0)
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Something went wrong during logout' });
  }
};


// Admin Role
// Delete User

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userIdToDelete = parseInt(id);

    // Prevent admin from deleting themselves
    if (req.userId === userIdToDelete) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userIdToDelete } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({ where: { id: userIdToDelete } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};