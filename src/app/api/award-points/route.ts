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

    // Award referrer bonus if this is the referred user's first review
    try {
      const { data: userProfile } = await (admin as any)
        .from('profiles')
        .select('referred_by')
        .eq('id', userId)
        .single();

      if (userProfile?.referred_by) {
        const { data: referralRow } = await (admin as any)
          .from('referral_signups')
          .select('id')
          .eq('referred_id', userId)
          .eq('review_points_awarded', false)
          .single();

        if (referralRow) {
          const { data: referrer } = await (admin as any)
            .from('profiles')
            .select('id, points, total_reviews, photo_reviews, total_reactions_received, total_referrals, created_at')
            .eq('referral_code', userProfile.referred_by)
            .single();

          if (referrer) {
            const newPoints = (referrer.points || 0) + 20;

            await (admin as any)
              .from('profiles')
              .update({ points: newPoints })
              .eq('id', referrer.id);

            await (admin as any)
              .from('referral_signups')
              .update({ review_points_awarded: true })
              .eq('referred_id', userId);

            await (admin as any)
              .from('notifications')
              .insert({
                user_id: referrer.id,
                type: 'referral',
                message: 'Someone you referred just wrote their first review! You earned 20 points.',
                link: '/profile',
              });

            const accountAgeDays = Math.floor(
              (Date.now() - new Date(referrer.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );

            const { data: newBadge } = await (admin as any).rpc('calculate_badge', {
              p_points:           newPoints,
              p_total_reviews:    referrer.total_reviews || 0,
              p_photo_reviews:    referrer.photo_reviews || 0,
              p_total_reactions:  referrer.total_reactions_received || 0,
              p_total_referrals:  referrer.total_referrals || 0,
              p_account_age_days: accountAgeDays,
            });

            if (newBadge) {
              await (admin as any)
                .from('profiles')
                .update({ badge: newBadge })
                .eq('id', referrer.id);
            }
          }
        }
      }
    } catch (referralErr) {
      console.error('Referral bonus error:', referralErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('award-points error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
