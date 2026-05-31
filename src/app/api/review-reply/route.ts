import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { review_id, business_id, userId, body } = await request.json();

    if (!review_id || !business_id || !userId || !body?.trim()) {
      return NextResponse.json({ error: 'Missing review_id, business_id, userId, or body' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Verify the current user is the claimed owner of this business
    const { data: business, error: bizErr } = await (admin as any)
      .from('businesses')
      .select('claimed_by, name, slug')
      .eq('id', business_id)
      .single();

    if (bizErr || !business || business.claimed_by !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Insert the reply
    const { error: insertErr } = await (admin as any)
      .from('review_replies')
      .insert({
        review_id,
        business_id,
        owner_id: userId,
        body: body.trim(),
      });

    if (insertErr) {
      console.error('review_replies insert error:', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Notify the review author
    const { data: review } = await (admin as any)
      .from('reviews')
      .select('user_id')
      .eq('id', review_id)
      .single();

    if (review?.user_id && review.user_id !== userId) {
      await (admin as any)
        .from('notifications')
        .insert({
          user_id: review.user_id,
          type: 'reply',
          message: `The owner of ${business.name} replied to your review`,
          link: `/business/${business.slug}`,
        });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('review-reply error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
