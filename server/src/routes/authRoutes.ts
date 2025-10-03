import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// @route   /api/auth
router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);

export default router;


