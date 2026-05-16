import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.DB_SERVICE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_DB_HOST!,
    process.env.DB_SERVICE_KEY!
  );

  const body = await request.json();
  const { businesses, city = 'Addis Ababa' } = body;

  if (!businesses || !Array.isArray(businesses)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const { data: categories } = await supabase.from('categories').select('id, name');
  const { data: cities } = await supabase.from('cities').select('id, name');

  const catMap: Record<string, string> = {};
  if (categories) {
    (categories as any[]).forEach((c: any) => { catMap[c.name] = c.id; });
  }

  const cityRow = (cities as any[])?.find((c: any) => c.name === city);
  if (!cityRow) {
    return NextResponse.json({ error: 'City not found' }, { status: 404 });
  }

  let imported = 0;
  let skipped = 0;

  for (const source of businesses as any[]) {
    const categoryName = source.category_name || 'Services';
    const categoryId = catMap[categoryName];

    const { error: insertErr } = await (supabase.from('businesses') as any).insert({
      name: source.name,
      city_id: cityRow.id,
      city_name: city,
      category_name: categoryName,
      category_id: categoryId || null,
      address: source.address || null,
      neighborhood: source.neighborhood || null,
      phone: source.phone || null,
      website: source.website || null,
      lat: source.lat || null,
      lng: source.lng || null,
      google_place_id: source.google_place_id || null,
      google_rating: source.google_rating || null,
      price_range: source.price_range || null,
      hours: source.hours || {},
      features: source.features || [],
      is_active: true,
    });

    if (insertErr) { skipped++; } else { imported++; }
  }

  return NextResponse.json({ imported, skipped });
}
