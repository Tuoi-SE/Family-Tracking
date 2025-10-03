import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Helper function to generate JWT
const generateToken = (id: string, username: string, role: UserRole) => {
  return jwt.sign({ sub: id, username, role }, JWT_SECRET, { expiresIn: '30d' });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response) => {
  const { username, password, fullName, role } = req.body;

  if (!username || !password || !fullName) {
    return res.status(400).json({ message: 'Please provide username, password, and full name' });
  }

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const newUser = await User.create({
      username,
      password,
      fullName,
      role: role || 'user', // Default to 'user' if role is not provided
    });

    if (newUser) {
      const token = generateToken((newUser._id as any).toString(), newUser.username, newUser.role);
      res.status(201).json({
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          fullName: newUser.fullName,
          role: newUser.role,
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken((user._id as any).toString(), user.username, user.role);
      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req: Request, res: Response) => {
  // The user object is attached to the request by the authMiddleware
  const user = await User.findById(req.user!.sub).select('-password');

  if (user) {
    res.json({
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      tracking: user.tracking,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};


