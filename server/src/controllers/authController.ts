import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { AuthRequest } from '../middleware/verifyToken';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return res.status(401).json({ error: error.message });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    res.json({
      session: data.session,
      user: user,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { society: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const register = async (req: AuthRequest, res: Response) => {
  const { email, password, name, role, societyId } = req.body;

  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, societyId, name }
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // 2. Create user profile in Prisma
    const newUser = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        name,
        role: role as Role,
        societyId,
      },
    });

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changeRole = async (req: AuthRequest, res: Response) => {
  const { userId, newRole, societyId } = req.body;

  try {
    // Update Supabase metadata
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole, societyId }
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // Update Prisma
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole as Role,
        societyId: societyId || null,
      },
    });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
