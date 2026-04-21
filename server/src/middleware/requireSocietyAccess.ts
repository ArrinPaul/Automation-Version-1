import { Response, NextFunction } from 'express';
import { AuthRequest } from './verifyToken';
import { Role } from '@prisma/client';

export const requireSocietyAccess = () => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Management has global access
    if (req.user.role === Role.MANAGEMENT) {
      return next();
    }

    const requestedSocietyId = req.params.societyId || req.body.societyId || req.query.societyId;

    if (!requestedSocietyId) {
      return next(); // If no societyId specified in request, let the controller handle it or it's a general request
    }

    if (req.user.societyId !== requestedSocietyId) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this society' });
    }

    next();
  };
};
