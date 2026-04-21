import { Request, Response } from 'express';
import { societyRepository } from '../repositories/societyRepository';
import { AuthRequest } from '../middleware/verifyToken';
import { Role } from '@prisma/client';

export const getSocieties = async (req: AuthRequest, res: Response) => {
  try {
    const where: any = {};
    if (req.user?.role !== Role.MANAGEMENT && req.user?.societyId) {
      where.id = req.user.societyId;
    }
    const societies = await societyRepository.findAll(where);
    res.json(societies);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSocietyById = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    const society = await societyRepository.findById(id);
    if (!society) return res.status(404).json({ error: 'Society not found' });
    res.json(society);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSociety = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    const society = await societyRepository.update(id, req.body);
    res.json(society);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
