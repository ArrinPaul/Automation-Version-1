import { Response, NextFunction } from 'express';
import { AuthRequest } from './verifyToken';
import { Role } from '@prisma/client';
import { AppError } from './errorHandler';

export const requireSocietyAccess = () => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    // Management has global access
    if (req.user.role === Role.MANAGEMENT) {
      return next();
    }

    const routeSocietyId = req.params.societyId;
    const bodySocietyId = req.body?.societyId;
    const querySocietyId = req.query?.societyId;
    const societyIdFromSocietyRoute = req.baseUrl.includes('/societies') ? req.params.id : undefined;

    const requestedSocietyIdValue = routeSocietyId ?? bodySocietyId ?? querySocietyId ?? societyIdFromSocietyRoute;
    let requestedSocietyId: string | undefined;

    if (Array.isArray(requestedSocietyIdValue)) {
      requestedSocietyId = requestedSocietyIdValue[0];
    } else if (typeof requestedSocietyIdValue === 'string') {
      requestedSocietyId = requestedSocietyIdValue;
    }

    if (!requestedSocietyId) {
      return next(); // If no societyId specified in request, let the controller handle it or it's a general request
    }

    if (req.user.societyId !== requestedSocietyId) {
      return next(new AppError('Forbidden: You do not have access to this society', 403));
    }

    next();
  };
};
