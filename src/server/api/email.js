/**
 * Email API endpoint for sending emails
 * 
 * This file should be placed in your backend server code, not in the frontend.
 * For example, in a Next.js app, this could be in pages/api/email/send.js
 * or in a Node.js Express server in routes/email.js
 */

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Email configuration
const emailConfig = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER || 'adarsh@infin8t.tech',
      pass: process.env.SMTP_PASSWORD || 'Adarsh@800850' // Should be set in environment variables
    }
  },
  defaultFrom: process.env.SMTP_FROM || '"Neon App" <adarsh@infin8t.tech>'
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig.smtp);

// Verify connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// Email templates
const emailTemplates = {
  verification: ({ verificationLink }) => ({
    subject: 'Verify your email address',
    html: `
      <h1>Email Verification</h1>
      <p>Thank you for registering with Neon. Please click the link below to verify your email address:</p>
      <p><a href="${verificationLink}">Verify Email Address</a></p>
      <p>If you did not sign up for an account, you can safely ignore this email.</p>
    `
  }),
  'password-reset': ({ resetLink }) => ({
    subject: 'Reset your password',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset for your Neon account. Please click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `
  })
};

/**
 * Express route handler for sending emails
 * 
 * Example usage in Express:
 * ```
 * app.post('/api/email/send', sendEmailHandler);
 * ```
 */
const sendEmailHandler = async (req, res) => {
  try {
    const { to, subject, templateName, templateData } = req.body;
    
    // Validate required fields
    if (!to) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }
    
    if (!templateName) {
      return res.status(400).json({ error: 'Email template name is required' });
    }
    
    // Get template
    const template = emailTemplates[templateName];
    if (!template) {
      return res.status(400).json({ error: `Template '${templateName}' not found` });
    }
    
    // Generate email content from template
    const { subject: templateSubject, html } = template(templateData || {});
    
    // Send email
    const info = await transporter.sendMail({
      from: emailConfig.defaultFrom,
      to,
      subject: subject || templateSubject,
      html
    });
    
    console.log(`Email sent: ${info.messageId}`);
    
    return res.status(200).json({
      success: true,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
};

module.exports = {
  sendEmailHandler
};

/**
 * Example Next.js API route:
 * 
 * // pages/api/email/send.js
 * export default async function handler(req, res) {
 *   if (req.method !== 'POST') {
 *     return res.status(405).json({ error: 'Method not allowed' });
 *   }
 *   
 *   return await sendEmailHandler(req, res);
 * }
 */ 