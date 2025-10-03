import { Router } from 'express';
import { updateLocation, getLatestLocation } from '../controllers/locationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// @route   /api/locations

// This route is for the GPS device to send updates.
// In a real-world scenario, you'd want a different, more secure authentication method here (e.g., API Key).
router.post('/', updateLocation);

// This route is for the mobile app to get the latest location of a user it's tracking.
router.get('/:userId', authMiddleware, getLatestLocation);

export default router;
