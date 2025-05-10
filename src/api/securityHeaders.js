/**
 * Security headers configuration
 * 
 * This file contains recommended security headers that should be implemented
 * on the server-side to protect against common web vulnerabilities.
 * 
 * Instructions for implementation:
 * 1. For Node.js/Express servers, use the helmet package 
 * 2. For other servers, manually set these headers in your web server configuration
 */

// Example implementation for Express.js
/*
const helmet = require('helmet');
app.use(helmet());

// Or custom configuration:
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://*.neon.tech"],
        connectSrc: ["'self'", "https://*.neon.tech"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
  })
);
*/

/**
 * Recommended Security Headers
 */
export const securityHeaders = {
  // Prevents clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Prevents MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Controls how much information is included in error pages
  'X-DNS-Prefetch-Control': 'off',
  
  // Prevents XSS attacks
  'X-XSS-Protection': '1; mode=block',
  
  // Enforces HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Controls which features can be used in the browser
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // Controls which sources are allowed to be loaded
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://*.neon.tech;
    connect-src 'self' https://*.neon.tech;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    media-src 'none';
    frame-src 'none';
  `.replace(/\s+/g, ' ').trim(),
  
  // Prevents the page from being loaded in an iframe
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

/**
 * Instructions for securing cookies
 * 
 * When setting cookies, always use the following flags:
 * 
 * 1. Secure: Cookie only sent over HTTPS
 * 2. HttpOnly: Prevents JavaScript access to cookies
 * 3. SameSite=Strict: Prevents CSRF attacks
 * 
 * Example:
 * document.cookie = 'name=value; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600';
 * 
 * For server-side implementations, set these flags when creating cookies
 */

export default securityHeaders; 