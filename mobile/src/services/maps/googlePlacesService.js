// Google Places Nearby Search service
// Replaces the old Overpass API (OpenStreetMap) service.
// All exported function names remain the same so no import changes are needed.

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const NEARBY_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const PLACE_PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo';

// Maps to track categories from Google Place types
const GOOGLE_TYPE_TO_CATEGORY = {
  museum: 'museum',
  art_gallery: 'museum',
  zoo: 'attraction',
  amusement_park: 'attraction',
  tourist_attraction: 'attraction',
  natural_feature: 'attraction',
  park: 'attraction',
  point_of_interest: 'attraction',
};

const EXCLUDED_PLACE_TYPES = new Set([
  'travel_agency',
  'insurance_agency',
  'real_estate_agency',
  'finance',
  'accounting',
  'lawyer',
  'car_rental',
  'lodging',
  'store',
  'shopping_mall',
  'hospital',
  'doctor',
  'school',
  'university',
]);

const EXCLUDED_NAME_KEYWORDS = [
  'travel',
  'travels',
  'agency',
  'tours',
  'tour and travels',
  'company',
  'co.',
  'pvt',
  'ltd',
  'llp',
  'office',
  'services',
];

const PUBLIC_ATTRACTION_TYPES = new Set([
  'tourist_attraction',
  'museum',
  'art_gallery',
  'park',
  'natural_feature',
  'zoo',
  'aquarium',
  'church',
  'hindu_temple',
  'mosque',
  'synagogue',
  'city_hall',
  'stadium',
  'amusement_park',
]);

// ─── Core fetch ──────────────────────────────────────────────────────────────

async function googleNearbySearch({ latitude, longitude, radiusMeters, type, keyword }) {
  let url =
    `${NEARBY_SEARCH_URL}` +
    `?location=${latitude},${longitude}` +
    `&radius=${radiusMeters}` +
    `&key=${GOOGLE_KEY}`;

  if (type) url += `&type=${encodeURIComponent(type)}`;
  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Google Places request failed.');

  const data = await response.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API error: ${data.status}`);
  }

  return data.results || [];
}

// ─── Normalise a Google place to the shared shape ────────────────────────────

function normalizeGooglePlace(place) {
  const category =
    place.types?.reduce((found, t) => found || GOOGLE_TYPE_TO_CATEGORY[t], null) ||
    'attraction';

  const photoReference = place.photos?.[0]?.photo_reference || '';
  const imageUrl = photoReference
    ? `${PLACE_PHOTO_URL}?maxwidth=1400&photoreference=${encodeURIComponent(photoReference)}&key=${GOOGLE_KEY}`
    : '';

  return {
    id: place.place_id,
    label: place.name,
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng,
    imageUrl,
    tags: {
      tourism: category === 'museum' ? 'museum' : 'attraction',
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      openNow: place.opening_hours?.open_now,
    },
  };
}

function isLikelyPublicAttraction(place) {
  const types = place.types || [];
  if (types.some((type) => EXCLUDED_PLACE_TYPES.has(type))) {
    return false;
  }

  const lowerName = String(place.name || '').toLowerCase();
  if (EXCLUDED_NAME_KEYWORDS.some((keyword) => lowerName.includes(keyword))) {
    return false;
  }

  return types.some((type) => PUBLIC_ATTRACTION_TYPES.has(type));
}

function attractionPopularityScore(place) {
  const rating = Number(place.rating || 0);
  const ratingsCount = Number(place.user_ratings_total || 0);
  return rating * 100 + Math.min(ratingsCount, 5000) * 0.06;
}

// ─── Nearby Attractions (getNearbyAttractions) ───────────────────────────────

/**
 * Fetches real tourist attractions, museums, parks, etc. near a location.
 * Queries tourist_attraction and museum types, deduplicates by place_id.
 */
export async function getNearbyAttractions({ latitude, longitude, radiusMeters = 7000, limit = 12 }) {
  const [touristResult, museumResult, parkResult] = await Promise.allSettled([
    googleNearbySearch({ latitude, longitude, radiusMeters, type: 'tourist_attraction' }),
    googleNearbySearch({ latitude, longitude, radiusMeters, type: 'museum' }),
    googleNearbySearch({ latitude, longitude, radiusMeters, type: 'park' }),
  ]);

  const combined = [
    ...(touristResult.status === 'fulfilled' ? touristResult.value : []),
    ...(museumResult.status === 'fulfilled' ? museumResult.value : []),
    ...(parkResult.status === 'fulfilled' ? parkResult.value : []),
  ];

  // Deduplicate by place_id and require a name
  const seen = new Set();
  const deduped = combined.filter((p) => p.name && !seen.has(p.place_id) && seen.add(p.place_id));
  const strictPublic = deduped
    .filter((place) => isLikelyPublicAttraction(place))
    .filter((place) => Number(place.user_ratings_total || 0) >= 50 && Number(place.rating || 0) >= 4.0)
    .sort((a, b) => attractionPopularityScore(b) - attractionPopularityScore(a));

  if (strictPublic.length >= Math.min(4, limit)) {
    return strictPublic.slice(0, limit).map(normalizeGooglePlace);
  }

  const publicFallback = deduped
    .filter((place) => isLikelyPublicAttraction(place))
    .sort((a, b) => attractionPopularityScore(b) - attractionPopularityScore(a));
  return publicFallback.slice(0, limit).map(normalizeGooglePlace);
}

// ─── Nearby Amenities (getNearbyAmenities) ───────────────────────────────────

/**
 * Fetches a specific amenity type near a location.
 * amenity: 'restaurant' | 'atm' | 'toilets'
 */
export async function getNearbyAmenities({ amenity, latitude, longitude, radiusMeters = 1200, limit = 8 }) {
  // Map Overpass amenity names to Google Place types
  const typeMap = {
    restaurant: { type: 'restaurant' },
    atm: { type: 'atm' },
    toilets: { type: 'establishment', keyword: 'public toilet washroom' },
  };

  const { type, keyword } = typeMap[amenity] || { type: amenity };

  try {
    const results = await googleNearbySearch({
      latitude,
      longitude,
      radiusMeters,
      type,
      keyword,
    });

    return results
      .filter((place) => {
        if (!place?.name) {
          return false;
        }
        const placeTypes = place.types || [];
        const lowerName = String(place.name).toLowerCase();

        if (amenity === 'restaurant') {
          // Strict restaurant filtering: no hotels/guest houses/resorts.
          const isRestaurant = placeTypes.includes('restaurant');
          const hasHospitalityType = placeTypes.includes('lodging');
          const hasHotelLikeName =
            lowerName.includes('hotel') ||
            lowerName.includes('guest house') ||
            lowerName.includes('guesthouse') ||
            lowerName.includes('resort') ||
            lowerName.includes('inn');
          return isRestaurant && !hasHospitalityType && !hasHotelLikeName;
        }

        if (amenity === 'atm') {
          return placeTypes.includes('atm');
        }

        if (amenity === 'toilets') {
          return true;
        }

        return true;
      })
      .map(normalizeGooglePlace)
      .slice(0, limit);
  } catch (_error) {
    return [];
  }
}
