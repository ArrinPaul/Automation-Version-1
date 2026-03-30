import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Project, UserRole } from '../models';

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { societyId, status, category } = req.query;
    let filter: any = {};

    if (user.role === UserRole.SOCIETY_ADMIN || user.role === UserRole.VIEWER) {
      filter.societyId = user.societyId;
    } else if (societyId) {
      filter.societyId = societyId;
    }
    if (status) filter.status = status;
    if (category) filter.category = category;

    const projects = await Project.find(filter).sort({ startDate: -1 }).populate('createdBy', 'name');
    res.status(200).json({ success: true, data: projects, count: projects.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
};

export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id).populate('createdBy', 'name');
    if (!project) { res.status(404).json({ success: false, error: 'Project not found' }); return; }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch project' });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    if (user.role === UserRole.SOCIETY_ADMIN && user.societyId !== req.body.societyId) {
      res.status(403).json({ success: false, error: 'Cannot create project for another society' }); return;
    }
    const project = await Project.create({ ...req.body, createdBy: user._id });
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!project) { res.status(404).json({ success: false, error: 'Project not found' }); return; }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update project' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) { res.status(404).json({ success: false, error: 'Project not found' }); return; }
    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
};
