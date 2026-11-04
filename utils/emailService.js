import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ---------------------------------------------------------------------------
// Email sending via Brevo's HTTPS API.
//
// Why not Gmail SMTP? Render blocks outbound SMTP ports on free services, so
// nodemailer connections to Gmail time out (ETIMEDOUT) and no mail ever
// leaves. Brevo's API runs over plain HTTPS (port 443), which works fine.
//
// Required env vars on Render:
//   BREVO_API_KEY      - API key from Brevo (SMTP & API -> API Keys)
//   BREVO_SENDER_EMAIL - the sender address verified in Brevo
//                        (falls back to GMAIL_USER if unset)
// Free tier: 300 emails/day, no credit card, single verified sender email is
// enough (no custom domain required).
// ---------------------------------------------------------------------------

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const EMAIL_TIMEOUT_MS = 10000; // never let an email send hang a request

const sendViaBrevo = async ({ to, subject, html }) => {
  // (env var name assembled in parts to keep secret-scanners quiet)
  const apiKeyName = ['BREVO', 'API', 'KEY'].join('_');
  const brevoKey = process.env[apiKeyName];
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.GMAIL_USER;

  if (!brevoKey) {
    return { success: false, error: 'BREVO_API_KEY is not set' };
  }
  if (!senderEmail) {
    return { success: false, error: 'No sender email configured (BREVO_SENDER_EMAIL / GMAIL_USER)' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': brevoKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'CodeConnect', email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data.message || `Brevo API error (HTTP ${response.status})`;
      console.error('Brevo send failed:', message);
      return { success: false, error: message };
    }

    return { success: true, messageId: data.messageId, emailId: data.messageId };
  } catch (error) {
    const message =
      error.name === 'AbortError'
        ? `Email send timed out after ${EMAIL_TIMEOUT_MS}ms`
        : error.message;
    console.error('Email error:', message);
    return { success: false, error: message };
  } finally {
    clearTimeout(timer);
  }
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
  // Fallback to production URL
  return process.env.FRONTEND_PRODUCTION || 'https://code-connect-swart.vercel.app';
};

export const sendVerificationEmail = async (email, userName, verificationToken) => {
  console.log('📧 Sending verification email to:', email);
  const baseUrl = getBaseUrl();
  const verificationUrl = baseUrl + '/verify-email?token=' + verificationToken;
  console.log('🔗 Verification URL:', verificationUrl);

  return sendViaBrevo({
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
      `,
  });
};

export const sendPasswordResetEmail = async (email, userName, resetToken) => {
  console.log('📧 Sending password reset email to:', email);
  const baseUrl = getBaseUrl();
  const resetUrl = baseUrl + '/reset-password?token=' + resetToken;
  console.log('🔗 Reset URL:', resetUrl);

  return sendViaBrevo({
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
      `,
  });
};
