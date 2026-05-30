import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, reviewId } = await request.json();

    if (!userId || !reviewId) {
      return NextResponse.json({ error: 'Missing userId or reviewId' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: review, error: fetchErr } = await (admin as any)
      .from('reviews')
      .select('body, photo_urls')
      .eq('id', reviewId)
      .single();

    if (fetchErr || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const photoCount = Array.isArray(review.photo_urls) ? review.photo_urls.length : 0;

    const wordCount = review.body?.trim().split(/\s+/).filter(Boolean).length ?? 0;
    if (wordCount < 50) {
      return NextResponse.json({ success: false, reason: 'too_short' });
    }

    const { error: rpcErr } = await (admin as any).rpc('award_review_points', {
      p_user_id: userId,
      p_review_id: reviewId,
      p_photo_count: photoCount,
    });

    if (rpcErr) {
      console.error('award_review_points RPC error:', rpcErr);
      return NextResponse.json({ error: rpcErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('award-points error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
