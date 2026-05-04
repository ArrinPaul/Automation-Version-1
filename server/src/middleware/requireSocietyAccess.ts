import { Response, NextFunction } from 'express';
import { AuthRequest, SUPER_ADMIN_ROLES } from './verifyToken';
import { AppError } from './errorHandler';

export const requireSocietyAccess = () => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    // Super admins have global access
    if (SUPER_ADMIN_ROLES.includes(req.user.role)) return next();

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

    if (!requestedSocietyId) return next();

    if (req.user.societyId !== requestedSocietyId) {
      return next(new AppError('Forbidden: You do not have access to this society', 403));
    }

    next();
  };
};
