import { Request, Response, NextFunction } from 'express';

/**
 * 🛡️ Security Headers Middleware
 * 
 * Adds additional security headers beyond what Helmet provides.
 * Should be applied after Helmet.
 */

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // XSS Protection - enable browser's XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer Policy - don't leak referrer info
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy - restrict browser features
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // Content Security Policy - strict policy
  // Note: Adjust based on your actual needs
  // Removed 'unsafe-inline' and 'unsafe-eval' for better security
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https: wss:; " +
    "frame-ancestors 'none';"
  );

  // Cache Control - don't cache sensitive data
  if (req.method !== 'GET') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
  }

  // HSTS - Force HTTPS (only in production with proper setup)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  next();
};

/**
 * 🛡️ CORS Security Headers
 * 
 * Additional CORS security configurations
 */
export const corsSecurityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  // Expose headers that are safe to expose
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Page-Count');

  // Cache preflight requests for 1 hour
  res.setHeader('Access-Control-Max-Age', '3600');

  next();
};
