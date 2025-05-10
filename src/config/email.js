/**
 * Email configuration for application
 * 
 * Note: For production, store sensitive information in environment variables
 * rather than hardcoding them here
 */

export const emailConfig = {
  // SMTP configuration
  smtp: {
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'adarsh@infin8t.tech',
      pass: process.env.SMTP_PASSWORD // Should be set in environment variable
    }
  },
  
  // IMAP configuration (for email reading if needed)
  imap: {
    host: 'imap.hostinger.com',
    port: 993,
    secure: true
  },
  
  // POP3 configuration (alternative to IMAP)
  pop: {
    host: 'pop.hostinger.com',
    port: 995,
    secure: true
  },
  
  // Default sender details
  defaultFrom: '"Neon App" <adarsh@infin8t.tech>'
};

/**
 * IMPORTANT: In production, use environment variables:
 * 
 * For Node.js server:
 * - Store credentials in .env file (add to .gitignore)
 * - Load with dotenv: require('dotenv').config()
 * - Access with process.env.SMTP_USER, process.env.SMTP_PASSWORD
 * 
 * For client-side apps, use backend API endpoints to send emails
 * rather than including SMTP credentials in frontend code.
 */ 