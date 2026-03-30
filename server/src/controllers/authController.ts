import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models';
import { AuthRequest } from '../middleware/authMiddleware';

// Generate JWT
const generateToken = (userId: string, role: string): string => {
  const secret: jwt.Secret = process.env.JWT_SECRET!;
  return jwt.sign({ userId, role }, secret, {
    expiresIn: (process.env.JWT_EXPIRY || '7d') as string,
  } as jwt.SignOptions);
};

// Generate Refresh Token
const generateRefreshToken = (userId: string): string => {
  const secret: jwt.Secret = process.env.JWT_REFRESH_SECRET!;
  return jwt.sign({ userId }, secret, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRY || '30d') as string,
  } as jwt.SignOptions);
};

/**
 * POST /api/auth/register
 * Super Admin only — creates new users with assigned roles.
 */
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, societyId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, error: 'Name, email, password, and role are required' });
      return;
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({ success: false, error: `Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}` });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, error: 'User with this email already exists' });
      return;
    }

    // Society Admin and Viewer need a societyId
    if ((role === UserRole.SOCIETY_ADMIN || role === UserRole.VIEWER) && !societyId) {
      res.status(400).json({ success: false, error: 'societyId is required for Society Admin and Viewer roles' });
      return;
    }

    const user = await User.create({ name, email, password, role, societyId });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
};

/**
 * POST /api/auth/login
 * Public — authenticates user and returns JWT.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    // Find user with password (not excluded)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const token = generateToken((user._id as any).toString(), user.role);
    const refreshToken = generateRefreshToken((user._id as any).toString());

    res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          societyId: user.societyId,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
};

/**
 * POST /api/auth/refresh
 * Refreshes an expired access token using a valid refresh token.
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({ success: false, error: 'Refresh token is required' });
      return;
    }

    const secret: jwt.Secret = process.env.JWT_REFRESH_SECRET!;
    const decoded = jwt.verify(token, secret) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    const newToken = generateToken((user._id as any).toString(), user.role);
    const newRefreshToken = generateRefreshToken((user._id as any).toString());

    res.status(200).json({
      success: true,
      data: { token: newToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
};

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * PUT /api/auth/password
 * Authenticated user changes their own password.
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: 'Current and new password are required' });
      return;
    }

    const user = await User.findById(req.user!._id).select('+password');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Current password is incorrect' });
      return;
    }

    user.password = newPassword;
    await user.save(); // pre-save hook hashes it

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
