import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { register, login, me, listUsers } from '../controllers/authController';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/me', authMiddleware, me);
router.get('/admin/users', authMiddleware, requireRole('admin'), listUsers);

export default router;


