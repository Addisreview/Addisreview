// src/app/api/business/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, userId, updates } = body;

    if (!businessId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_DB_HOST!,
      process.env.DB_SERVICE_KEY!
    );

    // Verify the user owns this business
    const { data: business } = await supabase
      .from('businesses')
      .select('id, claimed_by, is_claimed')
      .eq('id', businessId)
      .single() as any;

    if (!business || business.claimed_by !== userId || !business.is_claimed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only allow safe fields to be updated
    const allowedFields = [
      'description', 'phone', 'website', 'email', 'address',
      'neighborhood', 'hours', 'features', 'price_range', 'cover_photo_url', 'photos'
    ];

    const safeUpdates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (key in updates) safeUpdates[key] = updates[key];
    }

    safeUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('businesses')
      .update(safeUpdates)
      .eq('id', businessId);

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('business update error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
