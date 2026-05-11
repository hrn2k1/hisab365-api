import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

/**
 * Extend Express Request to include user information
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        contactNumber: string;
        name: string;
        type: string;
        companyIds: string[];
        loggedInCompanyId?: string;
      };
    }
  }
}

/**
 * Bearer token authentication middleware
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header. Format: Bearer <token>',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }

    // Attach user info to request
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
}
