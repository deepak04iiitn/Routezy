// Google Directions + Distance Matrix service
// Replaces the old OSRM service.
// All exported function names remain the same so no import changes are needed.

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const DISTANCE_MATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';
const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';

// ─── Haversine fallback (kept for offline/error cases) ──────────────────────

export function haversineDistanceKm(a, b) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const q =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude));
  return R * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}

export function buildFallbackMatrix(points) {
  const distances = points.map((from, i) =>
    points.map((to, j) => (i === j ? 0 : haversineDistanceKm(from, to) * 1000))
  );
  // Assume 24 km/h average city speed for duration fallback
  const durations = distances.map((row) => row.map((m) => (m / 1000 / 24) * 3600));
  return { distances, durations };
}

// ─── Polyline decoder ────────────────────────────────────────────────────────

function decodePolyline(encoded) {
  const coords = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 32);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 32);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return coords;
}

// ─── Route between two points (getOsrmRoute) ────────────────────────────────

/**
 * Returns { distanceMeters, durationSeconds, geometry: [{latitude, longitude}] }
 */
export async function getOsrmRoute(startPoint, endPoint) {
  const url =
    `${DIRECTIONS_URL}` +
    `?origin=${startPoint.latitude},${startPoint.longitude}` +
    `&destination=${endPoint.latitude},${endPoint.longitude}` +
    `&key=${GOOGLE_KEY}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Route request failed.');

  const data = await response.json();
  if (data.status !== 'OK') throw new Error(`Directions API error: ${data.status}`);

  const route = data.routes?.[0];
  if (!route) throw new Error('No route available for the selected points.');

  const leg = route.legs[0];
  return {
    distanceMeters: leg.distance.value,
    durationSeconds: leg.duration.value,
    geometry: decodePolyline(route.overview_polyline.points),
  };
}

// ─── Distance matrix for N points (getOsrmDistanceMatrix) ───────────────────

/**
 * Returns { durations: number[][], distances: number[][] }
 * where durations[i][j] = seconds, distances[i][j] = meters.
 * Falls back to haversine matrix if Google API fails.
 */
export async function getOsrmDistanceMatrix(points) {
  if (!points?.length) return { durations: [], distances: [] };
  if (points.length === 1) return { durations: [[0]], distances: [[0]] };

  try {
    const coordsStr = points.map((p) => `${p.latitude},${p.longitude}`).join('|');
    const url =
      `${DISTANCE_MATRIX_URL}` +
      `?origins=${encodeURIComponent(coordsStr)}` +
      `&destinations=${encodeURIComponent(coordsStr)}` +
      `&key=${GOOGLE_KEY}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Distance Matrix request failed.');

    const data = await response.json();
    if (data.status !== 'OK' || !data.rows?.length) {
      throw new Error(`Distance Matrix error: ${data.status}`);
    }

    const durations = data.rows.map((row) =>
      row.elements.map((el) => (el.status === 'OK' ? el.duration.value : Infinity))
    );
    const distances = data.rows.map((row) =>
      row.elements.map((el) => (el.status === 'OK' ? el.distance.value : Infinity))
    );

    return { durations, distances };
  } catch (_error) {
    // Graceful fallback to haversine estimates
    return buildFallbackMatrix(points);
  }
}
