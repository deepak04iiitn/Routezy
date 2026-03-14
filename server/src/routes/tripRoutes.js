import { Router } from 'express';
import {
  createTrip,
  generateTripDraft,
  getTripById,
  listTrips,
  updateTripStatus,
} from '../controllers/tripController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/generate', requireAuth, generateTripDraft);
router.post('/', requireAuth, createTrip);
router.get('/', requireAuth, listTrips);
router.get('/:tripId', requireAuth, getTripById);
router.patch('/:tripId/status', requireAuth, updateTripStatus);

export default router;


