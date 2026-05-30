import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { businessId, userId } = await request.json();

    if (!businessId || !userId) {
      return NextResponse.json({ error: 'Missing businessId or userId' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: business, error: fetchErr } = await (admin as any)
      .from('businesses')
      .select('id, claimed_by, is_claimed')
      .eq('id', businessId)
      .single();

    if (fetchErr || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (business.claimed_by !== userId || !business.is_claimed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error: updateErr } = await (admin as any)
      .from('businesses')
      .update({ is_claimed: false, claimed_by: null, is_verified: false })
      .eq('id', businessId);

    if (updateErr) {
      console.error('Unclaim update error:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('unclaim error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
