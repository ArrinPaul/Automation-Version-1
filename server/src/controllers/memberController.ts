import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../middleware/verifyToken';
import { AppError } from '../middleware/errorHandler';
import { memberRepository } from '../repositories/memberRepository';

export const getMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {};
    if (req.user?.role !== Role.MANAGEMENT && req.user?.societyId) {
      where.societyId = req.user.societyId;
    }

    const members = await memberRepository.findAll(where);
    return res.json(members);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch members', 500));
  }
};

export const getMemberById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const member = await memberRepository.findById(req.params.id as string);
    if (!member) {
      return next(new AppError('Member not found', 404));
    }
    return res.json(member);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch member', 500));
  }
};

export const createMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const member = await memberRepository.create(req.body);
    return res.status(201).json(member);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to create member', 500));
  }
};

export const updateMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const member = await memberRepository.update(req.params.id as string, req.body);
    return res.json(member);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to update member', 500));
  }
};

export const deleteMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await memberRepository.delete(req.params.id as string);
    return res.status(204).send();
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to delete member', 500));
  }
};
