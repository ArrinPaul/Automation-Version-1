import { Response, NextFunction } from 'express';
import { Role, ProjectCategory, ProjectStatus } from '@prisma/client';
import { AuthRequest, SUPER_ADMIN_ROLES } from '../middleware/verifyToken';
import { AppError } from '../middleware/errorHandler';
import { projectRepository } from '../repositories/projectRepository';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';

const isSuperAdmin = (req: AuthRequest) => SUPER_ADMIN_ROLES.includes(req.user!.role);

/**
 * Validates amount as a positive decimal.
 */
const positiveDecimal = z.union([z.number(), z.string()])
  .refine((val) => {
    const num = typeof val === 'string' ? Number.parseFloat(val) : val;
    return !Number.isNaN(num) && num > 0;
  }, { message: 'Amount must be a positive number' })
  .transform((val) => new Decimal(typeof val === 'string' ? val : val.toString()));

/**
 * Validates dates as ISO 8601 strings, converting to Date objects.
 */
const isoDate = z.string()
  .refine((val) => !Number.isNaN(Date.parse(val)), { message: 'Invalid date format. Use ISO 8601 (e.g., 2026-04-21T10:00:00Z)' })
  .transform(str => new Date(str));

const projectSchema = z.object({
  societyId: z.string().uuid('Invalid society ID format'),
  title: z.string().min(1, 'Project title is required').max(255),
  category: z.nativeEnum(ProjectCategory),
  sanctioningBody: z.string().min(1, 'Sanctioning body is required').max(255),
  amountSanctioned: positiveDecimal,
  startDate: isoDate,
  status: z.nativeEnum(ProjectStatus),
  description: z.string().min(1, 'Description is required').max(1000),
});

const projectUpdateSchema = projectSchema.partial();

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {};
    if (!isSuperAdmin(req) && req.user?.societyId) {
      where.societyId = req.user.societyId;
    }

    const projects = await projectRepository.findAll(where);
    return res.status(200).json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
    return next(new AppError(errorMessage, 500));
  }
};

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;

    if (!projectId) {
      return next(new AppError('Project ID is required', 400));
    }

    const project = await projectRepository.findById(projectId);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    if (!isSuperAdmin(req) && project.societyId !== req.user?.societyId) {
      return next(new AppError('Forbidden: You do not have access to this project', 403));
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project';
    return next(new AppError(errorMessage, 500));
  }
};

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = projectSchema.parse(req.body);
    const project = await projectRepository.create(validatedData);
    return res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(JSON.stringify(formattedErrors), 400));
    }
    const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
    return next(new AppError(errorMessage, 500));
  }
};

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;

    if (!projectId) {
      return next(new AppError('Project ID is required', 400));
    }

    const validatedData = projectUpdateSchema.parse(req.body);

    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!isSuperAdmin(req)) {
      const existingProject = await projectRepository.findById(projectId);
      if (!existingProject) {
        return next(new AppError('Project not found', 404));
      }

      if (existingProject.societyId !== req.user.societyId) {
        return next(new AppError('Forbidden: You do not have access to this project', 403));
      }

      if (validatedData.societyId && validatedData.societyId !== req.user.societyId) {
        return next(new AppError('Forbidden: Cannot reassign project to another society', 403));
      }
    }

    const project = await projectRepository.update(projectId, validatedData);
    return res.status(200).json({
      success: true,
      data: project,
      message: 'Project updated successfully',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(JSON.stringify(formattedErrors), 400));
    }
    const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
    return next(new AppError(errorMessage, 500));
  }
};

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;

    if (!projectId) {
      return next(new AppError('Project ID is required', 400));
    }

    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!isSuperAdmin(req)) {
      const existingProject = await projectRepository.findById(projectId);
      if (!existingProject) {
        return next(new AppError('Project not found', 404));
      }

      if (existingProject.societyId !== req.user.societyId) {
        return next(new AppError('Forbidden: You do not have access to this project', 403));
      }
    }

    await projectRepository.delete(projectId);
    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
    return next(new AppError(errorMessage, 500));
  }
};
