// Google Maps Geocoding + Places Autocomplete service
// Replaces the old Photon (komoot) service.
// All exported function names remain the same so no import changes are needed.

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const PLACES_AUTOCOMPLETE = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const PLACES_DETAILS = 'https://maps.googleapis.com/maps/api/place/details/json';
const GEOCODING = 'https://maps.googleapis.com/maps/api/geocode/json';

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractReadableLabel(addressComponents = [], formattedAddress = '') {
  const find = (type) =>
    addressComponents.find((c) => c.types.includes(type))?.long_name;
  return (
    find('sublocality_level_1') ||
    find('sublocality') ||
    find('locality') ||
    find('administrative_area_level_2') ||
    find('administrative_area_level_1') ||
    formattedAddress.split(',')[0] ||
    'Local Area'
  );
}

// ─── Autocomplete (searchPhotonPlaces) ──────────────────────────────────────

/**
 * Returns autocomplete predictions from Google Places.
 * Each result has: { id, label, subtitle, placeId, latitude: null, longitude: null }
 * Coords are null until the user selects the suggestion (resolved via getPlaceCoords).
 */
export async function searchPhotonPlaces(query, limit = 5) {
  if (!query?.trim()) return [];

  const url =
    `${PLACES_AUTOCOMPLETE}?input=${encodeURIComponent(query.trim())}` +
    `&key=${GOOGLE_KEY}&language=en&limit=${limit}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to search places right now.');

  const data = await response.json();
  if (!data.predictions?.length) return [];

  return data.predictions.slice(0, limit).map((p) => ({
    id: p.place_id,
    label: p.structured_formatting?.main_text || p.description,
    subtitle: p.structured_formatting?.secondary_text || '',
    placeId: p.place_id,
    // Coordinates are resolved on selection via getPlaceCoords()
    latitude: null,
    longitude: null,
    source: 'autocomplete',
  }));
}

// ─── Resolve place coordinates from a Places place_id ───────────────────────

/**
 * Call this when the user taps an autocomplete suggestion to get real coords.
 * Returns { latitude, longitude } or null on failure.
 */
export async function getPlaceCoords(placeId) {
  if (!placeId) return null;

  const url =
    `${PLACES_DETAILS}?place_id=${encodeURIComponent(placeId)}` +
    `&fields=geometry,name&key=${GOOGLE_KEY}`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  const location = data.result?.geometry?.location;
  if (!location) return null;

  return { latitude: location.lat, longitude: location.lng };
}

// ─── Reverse Geocode (reverseGeocodeWithPhoton) ──────────────────────────────

/**
 * Converts GPS coordinates into a human-readable area name.
 * Returns a string like "Ayodhya", "Lalbagh", "Lucknow" etc.
 */
export async function reverseGeocodeWithPhoton(latitude, longitude) {
  try {
    const url = `${GEOCODING}?latlng=${latitude},${longitude}&key=${GOOGLE_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return 'Local Area';

    const data = await response.json();
    const result = data.results?.[0];
    if (!result) return 'Local Area';

    return extractReadableLabel(result.address_components, result.formatted_address);
  } catch (_error) {
    return 'Local Area';
  }
}

// ─── Forward Geocode (geocodeWithPhoton) ─────────────────────────────────────

/**
 * Converts a text query into coordinates.
 * Returns { label, latitude, longitude, source: 'manual' }
 */
export async function geocodeWithPhoton(query) {
  const url = `${GEOCODING}?address=${encodeURIComponent(query.trim())}&key=${GOOGLE_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not find coordinates for "${query}".`);

  const data = await response.json();
  const result = data.results?.[0];
  if (!result) throw new Error(`Could not find coordinates for "${query}".`);

  return {
    label:
      extractReadableLabel(result.address_components, result.formatted_address) ||
      result.formatted_address,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    source: 'manual',
  };
}
