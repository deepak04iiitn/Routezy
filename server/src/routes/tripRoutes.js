import { Router } from 'express';
import {
  createTrip,
  deleteTrip,
  generateTripDraft,
  getTripById,
  listTrips,
  updateTripLike,
  updateTripStatus,
} from '../controllers/tripController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/generate', requireAuth, generateTripDraft);
router.post('/', requireAuth, createTrip);
router.get('/', requireAuth, listTrips);
router.get('/:tripId', requireAuth, getTripById);
router.patch('/:tripId/status', requireAuth, updateTripStatus);
router.patch('/:tripId/like', requireAuth, updateTripLike);
router.delete('/:tripId', requireAuth, deleteTrip);

export default router;


