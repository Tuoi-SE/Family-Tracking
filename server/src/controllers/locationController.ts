import { Request, Response } from 'express';
import { Location } from '../models/Location';
import { User } from '../models/User';

/**
 * @desc    Update or create a location for a trackable device
 * @route   POST /api/locations
 * @access  Public (should be secured with an API key in production)
 */
export const updateLocation = async (req: Request, res: Response) => {
  const { userId, latitude, longitude } = req.body;

  if (!userId || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Missing userId, latitude, or longitude' });
  }

  // Get the socket.io instance from the app
  const io = req.app.get('socketio');

  try {
    // Verify that the userId belongs to a 'trackable' user
    const user = await User.findById(userId);
    if (!user || user.role !== 'trackable') {
      return res.status(404).json({ message: 'Trackable user not found' });
    }

    const newLocation = await Location.findOneAndUpdate(
      { userId },
      {
        userId,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Emit a 'new_location' event to the specific user's room
    io.to(userId.toString()).emit('new_location', {
      userId,
      latitude,
      longitude,
      timestamp: newLocation.updatedAt,
    });

    res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get the latest location of a specific user
 * @route   GET /api/locations/:userId
 * @access  Private (user must be tracking the target)
 */
export const getLatestLocation = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const requestingUser = await User.findById(req.user!.sub);

  // Check if the requesting user is an admin or is tracking the target user
  const isTracking = requestingUser?.tracking.some(id => id.toString() === userId);
  if (requestingUser?.role !== 'admin' && !isTracking) {
    return res.status(403).json({ message: 'Not authorized to track this user' });
  }

  try {
    const location = await Location.findOne({ userId }).sort({ updatedAt: -1 });

    if (!location) {
      return res.status(404).json({ message: 'Location not found for this user' });
    }

    res.status(200).json(location);
  } catch (error) {
    console.error('Error fetching latest location:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
