import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import { config } from '@/config/app';

/**
 * 🛡️ CSRF Protection Middleware
 * 
 * Implements Double Submit Cookie pattern for CSRF protection.
 * Generates a CSRF token, validates it on state-changing requests.
 * 
 * The token is:
 * 1. Generated on each request to GET routes
 * 2. Set as a cookie (httpOnly for security)
 * 3. Required as a header on POST/PUT/PATCH/DELETE requests
 */

const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_TOKEN_HEADER = 'x-csrf-token';

/**
 * Generate a secure CSRF token
 */
function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Middleware to generate and set CSRF token cookie on GET requests
 * Also validates CSRF token on state-changing requests
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  const isGetRequest = req.method === 'GET';
  const isSafeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);

  // GET requests: generate and set CSRF token
  if (isGetRequest) {
    // Check if token already exists in cookies
    let csrfToken = req.cookies?.[CSRF_TOKEN_COOKIE];

    if (!csrfToken) {
      csrfToken = generateCsrfToken();
    }

    // Set httpOnly CSRF cookie
    res.cookie(CSRF_TOKEN_COOKIE, csrfToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    // Also expose token via header for frontend to read (non-httpOnly)
    // This allows frontend to read the token and send it back
    if (!req.cookies?.[CSRF_TOKEN_COOKIE]) {
      res.setHeader(CSRF_TOKEN_HEADER, csrfToken);
    }

    return next();
  }

  // State-changing requests: validate CSRF token
  if (!isSafeMethod) {
    const csrfTokenFromCookie = req.cookies?.[CSRF_TOKEN_COOKIE];
    const csrfTokenFromHeader = req.headers[CSRF_TOKEN_HEADER] as string | undefined;

    // If no CSRF token in cookie, this might be a cross-origin request
    // Allow it only if it's from our own origin (checked by CORS)
    if (!csrfTokenFromCookie) {
      // Check Referer header for same-origin requests
      const referer = req.headers.referer;
      const origin = req.headers.origin;

      if (referer || origin) {
        const allowedOrigins = [config.CLIENT_URL, config.ADMIN_URL, config.LANDING_URL];
        
        let requestOrigin: string;
        if (referer) {
          requestOrigin = new URL(referer).origin;
        } else if (origin) {
          requestOrigin = origin;
        } else {
          // No origin information, skip validation
          return next();
        }

        if (!allowedOrigins.includes(requestOrigin)) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'CSRF_INVALID',
              message: 'Invalid origin for request'
            }
          });
        }
      }
    } else if (csrfTokenFromHeader !== csrfTokenFromCookie) {
      // Double Submit Cookie validation
      return res.status(403).json({
        success: false,
        error: {
          code: 'CSRF_INVALID',
          message: 'Invalid CSRF token'
        }
      });
    }
  }

  next();
};

/**
 * Helper to get CSRF token for tests
 */
export const getCsrfToken = (): string => generateCsrfToken();
