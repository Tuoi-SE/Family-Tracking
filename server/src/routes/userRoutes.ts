import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserProfile,
  getTrackableUsers,
  updateTrackingList,
} from '../controllers/userController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// @route   /api/users

// --- User Routes ---
router.route('/profile').put(authMiddleware, updateUserProfile);
router.route('/profile/tracking').put(authMiddleware, updateTrackingList);
router.route('/trackable').get(authMiddleware, getTrackableUsers);

// --- Admin Routes ---
router.route('/')
  .get(authMiddleware, adminMiddleware, getUsers);

router.route('/:id')
  .get(authMiddleware, adminMiddleware, getUserById)
  .put(authMiddleware, adminMiddleware, updateUser)
  .delete(authMiddleware, adminMiddleware, deleteUser);

export default router;
