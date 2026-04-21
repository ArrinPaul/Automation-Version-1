import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../middleware/verifyToken';
import { AppError } from '../middleware/errorHandler';
import { projectRepository } from '../repositories/projectRepository';

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {};
    if (req.user?.role !== Role.MANAGEMENT && req.user?.societyId) {
      where.societyId = req.user.societyId;
    }

    const projects = await projectRepository.findAll(where);
    return res.json(projects);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch projects', 500));
  }
};

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await projectRepository.findById(req.params.id as string);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }
    return res.json(project);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch project', 500));
  }
};

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await projectRepository.create(req.body);
    return res.status(201).json(project);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to create project', 500));
  }
};

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await projectRepository.update(req.params.id as string, req.body);
    return res.json(project);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to update project', 500));
  }
};

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await projectRepository.delete(req.params.id as string);
    return res.status(204).send();
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to delete project', 500));
  }
};
