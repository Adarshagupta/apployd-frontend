/**
 * Email service utility for sending emails
 * 
 * This utility uses nodemailer to send emails from the application.
 * Note: For frontend applications, email sending should be done through a backend API.
 */

import { emailConfig } from '../config/email';

/**
 * Note: This implementation is for a Node.js server environment.
 * For frontend applications, use an API endpoint to send emails.
 * 
 * Example usage on the backend:
 * ```
 * const emailService = require('./emailService');
 * 
 * // Send verification email
 * await emailService.sendVerificationEmail({
 *   to: user.email,
 *   verificationLink: `https://yourapp.com/verify?token=${token}`
 * });
 * ```
 */

// Set up nodemailer (to be used in a Node.js environment)
// If using this in a frontend app, comment this out
/* 
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport(emailConfig.smtp);

// Verify connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});
*/

/**
 * Send a verification email to a user
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.verificationLink - Verification link
 */
export const sendVerificationEmail = async ({ to, verificationLink }) => {
  if (typeof window !== 'undefined') {
    // This is running in a browser - must use API
    return await sendEmailViaAPI({
      to,
      subject: 'Verify your email address',
      templateName: 'verification',
      templateData: { verificationLink }
    });
  }
  
  /* Node.js environment implementation:
  try {
    const info = await transporter.sendMail({
      from: emailConfig.defaultFrom,
      to,
      subject: 'Verify your email address',
      html: `
        <h1>Email Verification</h1>
        <p>Thank you for registering with Neon. Please click the link below to verify your email address:</p>
        <p><a href="${verificationLink}">Verify Email Address</a></p>
        <p>If you did not sign up for an account, you can safely ignore this email.</p>
      `
    });
    
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
  */
};

/**
 * Send a password reset email to a user
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.resetLink - Password reset link
 */
export const sendPasswordResetEmail = async ({ to, resetLink }) => {
  if (typeof window !== 'undefined') {
    // This is running in a browser - must use API
    return await sendEmailViaAPI({
      to,
      subject: 'Reset your password',
      templateName: 'password-reset',
      templateData: { resetLink }
    });
  }
  
  /* Node.js environment implementation:
  try {
    const info = await transporter.sendMail({
      from: emailConfig.defaultFrom,
      to,
      subject: 'Reset your password',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset for your Neon account. Please click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `
    });
    
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
  */
};

/**
 * Send an email via API
 * This is the method to use from frontend code
 */
export const sendEmailViaAPI = async ({ to, subject, templateName, templateData }) => {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        templateName,
        templateData
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending email via API:', error);
    throw error;
  }
}; 