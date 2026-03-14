import Trip from '../models/Trip.js';
import { generateItineraryPlan } from '../services/itineraryPlannerService.js';
import {
  validateItineraryGenerationPayload,
  validateTripCreationPayload,
  validateTripStatusPayload,
} from '../utils/validators.js';

function normalizeTripStatus(tripDoc) {
  const now = new Date();
  const start = new Date(`${tripDoc.startDate}T00:00:00`);
  const end = new Date(`${tripDoc.endDate}T23:59:59`);

  if (tripDoc.status === 'completed') {
    return 'completed';
  }
  if (start > now) {
    return 'upcoming';
  }
  if (end < now) {
    return 'completed';
  }
  return 'ongoing';
}

function publicTrip(tripDoc) {
  const object = tripDoc.toObject ? tripDoc.toObject() : tripDoc;
  return {
    id: object._id?.toString?.() || object.id,
    title: object.title,
    coverImageUrl: object.coverImageUrl || '',
    createdAt: object.createdAtIso || object.createdAt,
    startDate: object.startDate,
    endDate: object.endDate,
    durationDays: object.durationDays,
    budget: object.budget,
    from: object.from,
    status: normalizeTripStatus(object),
    optimization: object.optimization,
    stats: object.stats,
    days: object.days || [],
    updatedAt: object.updatedAt,
  };
}

export async function generateTripDraft(req, res, next) {
  try {
    const { errors, value } = validateItineraryGenerationPayload(req.body);
    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const draft = await generateItineraryPlan(value);
    return res.json({
      message: 'Itinerary generated successfully.',
      trip: draft,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createTrip(req, res, next) {
  try {
    const { errors, value } = validateTripCreationPayload(req.body);
    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const trip = await Trip.create({
      ...value,
      userId: req.auth.userId,
    });

    return res.status(201).json({
      message: 'Trip saved successfully.',
      trip: publicTrip(trip),
    });
  } catch (error) {
    return next(error);
  }
}

export async function listTrips(req, res, next) {
  try {
    const trips = await Trip.find({ userId: req.auth.userId }).sort({ startDate: -1, createdAt: -1 });
    return res.json({
      trips: trips.map(publicTrip),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTripById(req, res, next) {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, userId: req.auth.userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    return res.json({ trip: publicTrip(trip) });
  } catch (error) {
    return next(error);
  }
}

export async function updateTripStatus(req, res, next) {
  try {
    const { errors, value } = validateTripStatusPayload(req.body);
    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.tripId, userId: req.auth.userId },
      { status: value.status },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    return res.json({
      message: 'Trip status updated.',
      trip: publicTrip(trip),
    });
  } catch (error) {
    return next(error);
  }
}


