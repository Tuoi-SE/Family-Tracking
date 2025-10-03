import { Request, Response } from 'express';
import { User } from '../models/User';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.username = req.body.username || user.username;
      user.role = req.body.role || user.role;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.sub);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.username = req.body.username || user.username;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all trackable users
// @route   GET /api/users/trackable
// @access  Private
export const getTrackableUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: 'trackable' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add or remove a user from the tracking list
// @route   PUT /api/users/profile/tracking
// @access  Private
export const updateTrackingList = async (req: Request, res: Response) => {
  const { trackableUserId, action } = req.body; // action can be 'add' or 'remove'
  const userId = req.user!.sub;

  if (!trackableUserId || !action) {
    return res.status(400).json({ message: 'trackableUserId and action are required' });
  }

  try {
    const user = await User.findById(userId);
    const userToTrack = await User.findById(trackableUserId);

    if (!user || !userToTrack) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToTrack.role !== 'trackable') {
      return res.status(400).json({ message: 'Can only track users with the role trackable' });
    }

    const isAlreadyTracking = user.tracking.some(id => id.toString() === trackableUserId);

    if (action === 'add') {
      if (isAlreadyTracking) {
        return res.status(400).json({ message: 'Already tracking this user' });
      }
      user.tracking.push(userToTrack._id as any);
    } else if (action === 'remove') {
      if (!isAlreadyTracking) {
        return res.status(400).json({ message: 'Not tracking this user' });
      }
      user.tracking = user.tracking.filter(id => id.toString() !== trackableUserId);
    }

    const updatedUser = await user.save();
    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
