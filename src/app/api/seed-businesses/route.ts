import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import {
  searchNearbyPlaces,
  getPlaceDetails,
  googleTypesToCategory,
  parseGoogleHours,
  getPhotoUrl,
} from '@/lib/google-places';

// POST /api/seed-businesses
// Body: { city: string, lat: number, lng: number, types?: string[], limit?: number }
// Header: Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
export async function POST(request: NextRequest) {
  // Simple auth check
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.DB_SERVICE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { city = 'Addis Ababa', lat = 9.0320, lng = 38.7469, types = ['restaurant', 'cafe', 'lodging', 'shopping_mall'], limit = 50 } = body;

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ error: 'GOOGLE_PLACES_API_KEY not set' }, { status: 500 });
  }

  const supabase = createAdminClient();

  // Get city and category IDs from DB
  const { data: cityRow } = await supabase.from('cities').select('id').ilike('name', city).single();
  const { data: categories } = await supabase.from('categories').select('id, name');

  if (!cityRow) {
    return NextResponse.json({ error: `City "${city}" not found in DB` }, { status: 400 });
  }

  const catMap = Object.fromEntries((categories || []).map(c => [c.name, c.id]));

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const type of types) {
    try {
      const { results } = await searchNearbyPlaces(lat, lng, type);
      const batch = results.slice(0, Math.ceil(limit / types.length));

      for (const place of batch) {
        try {
          // Check if already imported
          const { data: existing } = await supabase
            .from('businesses')
            .select('id')
            .eq('google_place_id', place.place_id)
            .single();

          if (existing) { skipped++; continue; }

          // Get full details (includes phone, website, hours)
          const details = await getPlaceDetails(place.place_id);
          const source = details || place;

          const categoryName = googleTypesToCategory(source.types || []);
          const hours = parseGoogleHours(source.opening_hours?.weekday_text);
          const photoRef = source.photos?.[0]?.photo_reference;

          const { error: insertErr } = await supabase.from('businesses').insert({
            name: source.name,
            city_id: cityRow.id,
            city_name: city,
            category_name: categoryName,
            category_id: catMap[categoryName] || null,
            address: source.formatted_address || source.vicinity || null,
            neighborhood: source.vicinity || null,
            lat: source.geometry?.location?.lat || null,
            lng: source.geometry?.location?.lng || null,
            phone: source.formatted_phone_number || null,
            website: source.website || null,
            google_place_id: place.place_id,
            google_rating: source.rating || null,
            google_photo_ref: photoRef || null,
            cover_photo_url: photoRef ? getPhotoUrl(photoRef, 800) : null,
            price_range: source.price_level || null,
            hours,
            is_active: true,
          });

          if (insertErr) {
            errors.push(`${source.name}: ${insertErr.message}`);
          } else {
            imported++;
          }

          // Small delay to respect rate limits
          await new Promise(r => setTimeout(r, 100));
        } catch (e: unknown) {
          errors.push(`Place error: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    } catch (e: unknown) {
      errors.push(`Type "${type}" error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Update city place count
  await supabase.rpc('search_businesses', { city_filter: city, page_size: 1 }).then(async () => {
    const { count } = await supabase.from('businesses').select('id', { count: 'exact' }).eq('city_name', city);
    if (count) await supabase.from('cities').update({ place_count: count }).ilike('name', city);
  });

  return NextResponse.json({ success: true, imported, skipped, errors });
}
