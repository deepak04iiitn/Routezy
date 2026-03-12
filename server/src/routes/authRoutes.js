import { Router } from 'express';
import { getMe, googleAuth, logout, signin, signup } from '../controllers/authController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', googleAuth);
router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, logout);
router.get('/admin/check', requireAuth, requireAdmin, (_req, res) => {
  res.json({ message: 'Admin access granted.' });
});

export default router;

