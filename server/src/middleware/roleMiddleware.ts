import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { UserRole } from '../models';

/**
 * Role-based access control middleware.
 * Checks if the authenticated user's role is in the allowed list.
 * Must be used AFTER authMiddleware.
 */
const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

export default roleMiddleware;
