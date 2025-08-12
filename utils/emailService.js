import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    }
  });
};

const getBaseUrl = () => {
  // Priority: Production > Network > Local
  if (process.env.FRONTEND_PRODUCTION && process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_PRODUCTION;
  }
  // Use network IP for mobile access during development
  if (process.env.FRONTEND_NETWORK) {
    return process.env.FRONTEND_NETWORK;
  }
  // Fallback to localhost
  return process.env.FRONTEND_PRODUCTION || 'https://code-connect-swart.vercel.app';
};

export const sendVerificationEmail = async (email, userName, verificationToken) => {
  try {
    console.log('📧 Sending verification email to:', email);
    const baseUrl = getBaseUrl();
    const verificationUrl = baseUrl + '/verify-email?token=' + verificationToken;
    console.log('🔗 Verification URL:', verificationUrl);
    
    const transporter = createTransporter();
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'CodeConnect - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Hi ${userName}!</h1>
          <p style="font-size: 16px; line-height: 1.5;">
            Welcome to CodeConnect! Please verify your email address to complete your registration.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            This link will expire in 24 hours for security reasons.
          </p>
        </div>
      `
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async (email, userName, resetToken) => {
  try {
    console.log('📧 Sending password reset email to:', email);
    const baseUrl = getBaseUrl();
    const resetUrl = baseUrl + '/reset-password?token=' + resetToken;
    console.log('🔗 Reset URL:', resetUrl);
    
    const transporter = createTransporter();
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'CodeConnect - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Hi ${userName}!</h1>
          <p style="font-size: 16px; line-height: 1.5;">
            We received a request to reset your password for your CodeConnect account.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}">${resetUrl}</a>
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            This link will expire in 1 hour for security reasons. If you didn't request this reset, please ignore this email.
          </p>
        </div>
      `
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};
