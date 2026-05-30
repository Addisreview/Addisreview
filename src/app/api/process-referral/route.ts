import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { referralCode, newUserId } = await request.json();

    if (!referralCode || !newUserId) {
      return NextResponse.json({ error: 'Missing referralCode or newUserId' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Find referrer by referral code
    const { data: referrer } = await (admin as any)
      .from('profiles')
      .select('id, points, total_referrals, total_reviews, photo_reviews, total_reactions_received, created_at')
      .eq('referral_code', referralCode)
      .single();

    if (!referrer) {
      return NextResponse.json({ success: false, reason: 'invalid_code' });
    }

    // Prevent self-referral
    if (referrer.id === newUserId) {
      return NextResponse.json({ success: false, reason: 'invalid_code' });
    }

    // Insert referral signup record
    await (admin as any)
      .from('referral_signups')
      .insert({
        referral_code: referralCode,
        referrer_id: referrer.id,
        referred_id: newUserId,
        signup_points_awarded: false,
        review_points_awarded: false,
      });

    // Award +10 points to referrer and increment total_referrals
    const referrerPoints = referrer.points || 0;
    const referrerReferrals = referrer.total_referrals || 0;

    await (admin as any)
      .from('profiles')
      .update({
        points: referrerPoints + 10,
        total_referrals: referrerReferrals + 1,
      })
      .eq('id', referrer.id);

    // Store referral code on new user's profile
    await (admin as any)
      .from('profiles')
      .update({ referred_by: referralCode })
      .eq('id', newUserId);

    // Recalculate referrer's badge with updated values
    const accountAgeDays = Math.floor(
      (Date.now() - new Date(referrer.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    const { data: newBadge } = await (admin as any).rpc('calculate_badge', {
      p_points:           referrerPoints + 10,
      p_total_reviews:    referrer.total_reviews || 0,
      p_photo_reviews:    referrer.photo_reviews || 0,
      p_total_reactions:  referrer.total_reactions_received || 0,
      p_total_referrals:  referrerReferrals + 1,
      p_account_age_days: accountAgeDays,
    });

    if (newBadge) {
      await (admin as any)
        .from('profiles')
        .update({ badge: newBadge })
        .eq('id', referrer.id);
    }

    // Notify referrer
    await (admin as any)
      .from('notifications')
      .insert({
        user_id: referrer.id,
        type: 'referral',
        message: 'Someone signed up using your referral code! You earned 10 points.',
        link: '/profile',
      });

    // Award +5 bonus points to new user for signing up with a referral code
    const { data: newUserProfile } = await (admin as any)
      .from('profiles')
      .select('points')
      .eq('id', newUserId)
      .single();

    await (admin as any)
      .from('profiles')
      .update({ points: (newUserProfile?.points || 0) + 5 })
      .eq('id', newUserId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('process-referral error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
