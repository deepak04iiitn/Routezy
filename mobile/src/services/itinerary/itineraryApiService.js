import { apiClient } from '../api/client';

function getApiErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function generateTripDraftApi(payload) {
  try {
    const response = await apiClient.post('/api/trips/generate', payload);
    return response.data?.trip;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to generate itinerary.'));
  }
}

export async function createTripApi(payload) {
  try {
    const response = await apiClient.post('/api/trips', payload);
    return response.data?.trip;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to save trip.'));
  }
}

export async function listTripsApi() {
  try {
    const response = await apiClient.get('/api/trips');
    return response.data?.trips || [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load trips.'));
  }
}

export async function updateTripStatusApi(tripId, status) {
  try {
    const response = await apiClient.patch(`/api/trips/${tripId}/status`, { status });
    return response.data?.trip;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update trip status.'));
  }
}


