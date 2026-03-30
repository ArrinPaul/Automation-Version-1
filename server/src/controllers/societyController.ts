import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Society, UserRole } from '../models';

/**
 * GET /api/societies
 * List all societies. Society Admins/Viewers see only their assigned society.
 */
export const getSocieties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    let filter = {};

    // Scope to user's society if not admin/treasurer
    if (user.role === UserRole.SOCIETY_ADMIN || user.role === UserRole.VIEWER) {
      filter = { societyKey: user.societyId };
    }

    const societies = await Society.find(filter).sort({ shortName: 1 });
    res.status(200).json({ success: true, data: societies, count: societies.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch societies' });
  }
};

/**
 * GET /api/societies/:id
 * Get single society by societyKey.
 */
export const getSociety = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const society = await Society.findOne({ societyKey: req.params.id });
    if (!society) {
      res.status(404).json({ success: false, error: 'Society not found' });
      return;
    }

    // Scope check
    const user = req.user!;
    if ((user.role === UserRole.SOCIETY_ADMIN || user.role === UserRole.VIEWER) && user.societyId !== society.societyKey) {
      res.status(403).json({ success: false, error: 'Access denied to this society' });
      return;
    }

    res.status(200).json({ success: true, data: society });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch society' });
  }
};

/**
 * POST /api/societies
 * Create a new society. Super Admin only.
 */
export const createSociety = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { societyKey, name, shortName, budget } = req.body;

    const existing = await Society.findOne({ societyKey });
    if (existing) {
      res.status(409).json({ success: false, error: 'Society with this key already exists' });
      return;
    }

    const society = await Society.create({
      societyKey,
      name,
      shortName,
      budget: budget || 0,
      balance: budget || 0,
    });

    res.status(201).json({ success: true, data: society });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create society' });
  }
};

/**
 * PUT /api/societies/:id
 * Update society (name, budget, etc). Super Admin / SB Treasurer.
 */
export const updateSociety = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const society = await Society.findOneAndUpdate(
      { societyKey: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!society) {
      res.status(404).json({ success: false, error: 'Society not found' });
      return;
    }

    res.status(200).json({ success: true, data: society });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update society' });
  }
};

/**
 * PUT /api/societies/:id/office-bearers
 * Update office bearers for a society. Society Admin+ can manage their own, Admin manages all.
 */
export const updateOfficeBearers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const societyKey = req.params.id;

    // Scope check for Society Admin
    if (user.role === UserRole.SOCIETY_ADMIN && user.societyId !== societyKey) {
      res.status(403).json({ success: false, error: 'Cannot manage another society\'s team' });
      return;
    }

    const society = await Society.findOneAndUpdate(
      { societyKey },
      { $set: { officeBearers: req.body.officeBearers } },
      { new: true, runValidators: true }
    );

    if (!society) {
      res.status(404).json({ success: false, error: 'Society not found' });
      return;
    }

    res.status(200).json({ success: true, data: society });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update office bearers' });
  }
};

/**
 * PUT /api/societies/:id/members
 * Update members for a society. Society Admin+ can manage their own.
 */
export const updateMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const societyKey = req.params.id;

    if (user.role === UserRole.SOCIETY_ADMIN && user.societyId !== societyKey) {
      res.status(403).json({ success: false, error: 'Cannot manage another society\'s members' });
      return;
    }

    const society = await Society.findOneAndUpdate(
      { societyKey },
      { $set: { members: req.body.members } },
      { new: true, runValidators: true }
    );

    if (!society) {
      res.status(404).json({ success: false, error: 'Society not found' });
      return;
    }

    res.status(200).json({ success: true, data: society });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update members' });
  }
};

/**
 * DELETE /api/societies/:id
 * Delete a society. Super Admin only.
 */
export const deleteSociety = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const society = await Society.findOneAndDelete({ societyKey: req.params.id });

    if (!society) {
      res.status(404).json({ success: false, error: 'Society not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Society deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete society' });
  }
};
