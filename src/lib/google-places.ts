// ─── Google Places API Integration ────────────────────────────────────────
// Used to seed businesses from Google Places into our Supabase DB

const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: { weekday_text?: string[] };
  photos?: Array<{ photo_reference: string }>;
  geometry: { location: { lat: number; lng: number } };
  types: string[];
  formatted_phone_number?: string;
  website?: string;
}

// Map Google place types to our categories
const TYPE_MAP: Record<string, string> = {
  restaurant: 'Restaurants',
  cafe: 'Coffee & Buna',
  bakery: 'Coffee & Buna',
  lodging: 'Hotels',
  spa: 'Spas',
  beauty_salon: 'Spas',
  shopping_mall: 'Shopping',
  store: 'Shopping',
  night_club: 'Entertainment',
  bar: 'Entertainment',
  movie_theater: 'Entertainment',
  hospital: 'Healthcare',
  doctor: 'Healthcare',
  pharmacy: 'Healthcare',
};

export function googleTypesToCategory(types: string[]): string {
  for (const t of types) {
    if (TYPE_MAP[t]) return TYPE_MAP[t];
  }
  return 'Services';
}

// Search nearby places in a city
export async function searchNearbyPlaces(
  lat: number,
  lng: number,
  type: string,
  pagetoken?: string
): Promise<{ results: PlaceResult[]; next_page_token?: string }> {
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: '10000',
    type,
    key: API_KEY!,
    ...(pagetoken ? { pagetoken } : {}),
  });

  const res = await fetch(`${PLACES_BASE}/nearbysearch/json?${params}`);
  const data = await res.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places API error: ${data.status} — ${data.error_message || ''}`);
  }

  return {
    results: data.results || [],
    next_page_token: data.next_page_token,
  };
}

// Get full details for a single place
export async function getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: [
      'place_id','name','formatted_address','vicinity',
      'rating','user_ratings_total','price_level',
      'opening_hours','photos','geometry','types',
      'formatted_phone_number','website',
    ].join(','),
    key: API_KEY!,
  });

  const res = await fetch(`${PLACES_BASE}/details/json?${params}`);
  const data = await res.json();

  if (data.status !== 'OK') return null;
  return data.result;
}

// Build a Google photo URL from a photo reference
export function getPhotoUrl(photoRef: string, maxWidth = 800): string {
  return `${PLACES_BASE}/photo?maxwidth=${maxWidth}&photo_reference=${photoRef}&key=${API_KEY}`;
}

// Parse Google opening hours into our JSONB format
export function parseGoogleHours(weekdayText?: string[]): Record<string, string> {
  if (!weekdayText) return {};
  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const result: Record<string, string> = {};
  weekdayText.forEach((line, i) => {
    const parts = line.split(': ');
    result[days[i]] = parts[1] || 'Closed';
  });
  return result;
}
