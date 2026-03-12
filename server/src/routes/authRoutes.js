import { Router } from 'express';
import { getMe, logout, signin, signup } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, logout);

export default router;

