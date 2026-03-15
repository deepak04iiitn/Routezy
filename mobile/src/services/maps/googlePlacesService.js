// Google Places Nearby Search service
// Replaces the old Overpass API (OpenStreetMap) service.
// All exported function names remain the same so no import changes are needed.

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const NEARBY_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const PLACE_PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo';
const MAX_ATTRACTION_QUERY_VARIANTS = 10;
const MAX_CITY_QUERY_VARIANTS = 8;
const MAX_CITY_TEXT_SEARCH_PAGES = 2;

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
  'hospital',
  'doctor',
  'school',
  'university',
  'restaurant',
  'food',
  'cafe',
  'meal_takeaway',
  'meal_delivery',
  'train_station',
  'subway_station',
  'transit_station',
  'bus_station',
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
  'restaurant',
  'railway station',
  'train station',
  'metro station',
  'junction',
  'hotel',
  'resort',
  'guest house',
  'guesthouse',
  'hostel',
  'inn',
  'stay',
  'stays',
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
  'place_of_worship',
  'shopping_mall',
  'stadium',
  'amusement_park',
  'rv_park',
  'city_hall',
]);

const EXPANDED_ATTRACTION_QUERIES = [
  { type: 'tourist_attraction' },
  { type: 'museum' },
  { type: 'art_gallery' },
  { type: 'park' },
  { type: 'zoo' },
  { type: 'amusement_park' },
  { type: 'aquarium' },
  { type: 'hindu_temple' },
  { type: 'church' },
  { type: 'mosque' },
  { type: 'synagogue' },
  { keyword: 'fort palace castle monument heritage' },
  { keyword: 'old town heritage district archaeological ruins' },
  { keyword: 'viewpoint hill sunset sunrise skyline observation tower' },
  { keyword: 'river walk lake promenade ghat waterfront' },
  { keyword: 'famous market shopping district handicraft antique night market' },
  { keyword: 'famous street boulevard city square clock tower landmark bridge' },
  { keyword: 'theme park water park adventure park entertainment complex' },
  { keyword: 'science center planetarium exhibition hall cultural center' },
];

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function googleNearbySearchAllPages({ latitude, longitude, radiusMeters, type, keyword, maxPages = 1 }) {
  const allResults = [];
  let nextPageToken = null;
  let page = 0;

  do {
    let url =
      `${NEARBY_SEARCH_URL}` +
      `?location=${latitude},${longitude}` +
      `&radius=${radiusMeters}` +
      `&key=${GOOGLE_KEY}`;

    if (nextPageToken) {
      await sleep(1800);
      url = `${NEARBY_SEARCH_URL}?pagetoken=${encodeURIComponent(nextPageToken)}&key=${GOOGLE_KEY}`;
    } else {
      if (type) url += `&type=${encodeURIComponent(type)}`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      break;
    }
    const data = await response.json();
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS' && data.status !== 'INVALID_REQUEST') {
      break;
    }

    allResults.push(...(data.results || []));
    nextPageToken = data.next_page_token || null;
    page += 1;
  } while (nextPageToken && page < maxPages);

  return allResults;
}

// ─── Normalise a Google place to the shared shape ────────────────────────────

function normalizeGooglePlace(place) {
  const lowerName = String(place.name || '').toLowerCase();
  const hasViewpointSignal =
    place.types?.includes('natural_feature') ||
    lowerName.includes('viewpoint') ||
    lowerName.includes('sunset') ||
    lowerName.includes('sunrise') ||
    lowerName.includes('lookout') ||
    lowerName.includes('observation');
  const category =
    (hasViewpointSignal ? 'viewpoint' : null) ||
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
      placeTypes: Array.isArray(place.types) ? place.types : [],
    },
  };
}

function isExcludedStayFoodTransitPlace(place = {}) {
  const lowerName = String(place.name || place.label || '').toLowerCase();
  const rawTypes = [
    ...(Array.isArray(place.types) ? place.types : []),
    ...(Array.isArray(place.tags?.placeTypes) ? place.tags.placeTypes : []),
  ];
  const lowerTypes = rawTypes.map((type) => String(type || '').toLowerCase());
  const category = String(place.category || '').toLowerCase();
  const tourismTag = String(place.tags?.tourism || '').toLowerCase();

  if (lowerTypes.some((type) => EXCLUDED_PLACE_TYPES.has(type))) {
    return true;
  }
  if (EXCLUDED_NAME_KEYWORDS.some((keyword) => lowerName.includes(keyword))) {
    return true;
  }
  return (
    category === 'restaurant' ||
    category === 'hotel' ||
    category === 'lodging' ||
    tourismTag === 'hotel' ||
    tourismTag === 'hostel'
  );
}

function isLikelyPublicAttraction(place) {
  const types = place.types || [];
  if (types.some((type) => EXCLUDED_PLACE_TYPES.has(type)) || isExcludedStayFoodTransitPlace(place)) {
    return false;
  }

  const lowerName = String(place.name || '').toLowerCase();
  if (EXCLUDED_NAME_KEYWORDS.some((keyword) => lowerName.includes(keyword))) {
    return false;
  }

  const keywordBoost = [
    'fort',
    'palace',
    'castle',
    'museum',
    'monument',
    'heritage',
    'ruins',
    'viewpoint',
    'garden',
    'park',
    'temple',
    'church',
    'mosque',
    'shrine',
    'market',
    'bazaar',
    'ghat',
    'lake',
    'waterfall',
    'square',
    'bridge',
    'clock tower',
    'planetarium',
    'science center',
    'gallery',
    'aquarium',
    'amusement',
    'theme park',
  ];

  return (
    types.some((type) => PUBLIC_ATTRACTION_TYPES.has(type)) ||
    keywordBoost.some((keyword) => lowerName.includes(keyword))
  );
}

function attractionPopularityScore(place) {
  const rating = Number(place.rating || 0);
  const ratingsCount = Number(place.user_ratings_total || 0);
  return rating * 100 + Math.min(ratingsCount, 5000) * 0.06;
}

function compareByPopularityPriority(a, b) {
  const ratingsA = Number(a.user_ratings_total || 0);
  const ratingsB = Number(b.user_ratings_total || 0);
  if (ratingsA !== ratingsB) {
    return ratingsB - ratingsA;
  }
  const ratingA = Number(a.rating || 0);
  const ratingB = Number(b.rating || 0);
  if (ratingA !== ratingB) {
    return ratingB - ratingA;
  }
  const reviewsA = Number(a.user_ratings_total || 0);
  const reviewsB = Number(b.user_ratings_total || 0);
  return reviewsB - reviewsA;
}

function buildCityAttractionQueries(cityName) {
  const city = String(cityName || '').trim();
  return [
    `top tourist attractions in ${city}`,
    `best places to visit in ${city}`,
    `must visit places in ${city}`,
    `top rated museums in ${city}`,
    `top landmarks in ${city}`,
    `famous heritage sites in ${city}`,
    `top cultural places in ${city}`,
    `top things to do in ${city}`,
  ];
}

async function googleTextSearchAllPages({ query, maxPages = 1 }) {
  const allResults = [];
  let nextPageToken = null;
  let page = 0;

  do {
    let url = `${TEXT_SEARCH_URL}?query=${encodeURIComponent(query)}&key=${GOOGLE_KEY}`;
    if (nextPageToken) {
      await sleep(1800);
      url = `${TEXT_SEARCH_URL}?pagetoken=${encodeURIComponent(nextPageToken)}&key=${GOOGLE_KEY}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      break;
    }
    const data = await response.json();
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS' && data.status !== 'INVALID_REQUEST') {
      break;
    }
    allResults.push(...(data.results || []));
    nextPageToken = data.next_page_token || null;
    page += 1;
  } while (nextPageToken && page < maxPages);

  return allResults;
}

// ─── Nearby Attractions (getNearbyAttractions) ───────────────────────────────

/**
 * Fetches real tourist attractions, museums, parks, etc. near a location.
 * Queries tourist_attraction and museum types, deduplicates by place_id.
 */
export async function getNearbyAttractions({ latitude, longitude, radiusMeters = 7000, limit = 240 }) {
  const queryResults = await Promise.allSettled(
    EXPANDED_ATTRACTION_QUERIES.slice(0, MAX_ATTRACTION_QUERY_VARIANTS).map((query) =>
      googleNearbySearchAllPages({
        latitude,
        longitude,
        radiusMeters,
        type: query.type,
        keyword: query.keyword,
        maxPages: 1,
      })
    )
  );

  const combined = queryResults.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

  // Deduplicate by place_id and require a name
  const seen = new Set();
  const deduped = combined.filter((p) => p.name && !seen.has(p.place_id) && seen.add(p.place_id));
  const strictPublic = deduped
    .filter((place) => isLikelyPublicAttraction(place))
    .filter((place) => Number(place.user_ratings_total || 0) >= 20 && Number(place.rating || 0) >= 3.8)
    .sort((a, b) => attractionPopularityScore(b) - attractionPopularityScore(a));

  if (strictPublic.length >= Math.min(4, limit)) {
    return strictPublic.slice(0, limit).map(normalizeGooglePlace);
  }

  const publicFallback = deduped
    .filter((place) => isLikelyPublicAttraction(place))
    .sort((a, b) => attractionPopularityScore(b) - attractionPopularityScore(a));
  return publicFallback.slice(0, limit).map(normalizeGooglePlace);
}

export async function getCityTopAttractions({ cityName, limit = 240 }) {
  const queryResults = await Promise.allSettled(
    buildCityAttractionQueries(cityName)
      .slice(0, MAX_CITY_QUERY_VARIANTS)
      .map((query) => googleTextSearchAllPages({ query, maxPages: MAX_CITY_TEXT_SEARCH_PAGES }))
  );

  const combined = queryResults.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

  const seen = new Set();
  const deduped = combined.filter((p) => p.name && !seen.has(p.place_id) && seen.add(p.place_id));
  const strictPublic = deduped
    .filter((place) => isLikelyPublicAttraction(place))
    .filter((place) => Number(place.user_ratings_total || 0) >= 20 && Number(place.rating || 0) >= 3.8)
    .sort(compareByPopularityPriority);

  if (strictPublic.length >= Math.min(4, limit)) {
    return strictPublic.slice(0, limit).map(normalizeGooglePlace);
  }

  return deduped
    .filter((place) => isLikelyPublicAttraction(place))
    .sort(compareByPopularityPriority)
    .slice(0, limit)
    .map(normalizeGooglePlace);
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
