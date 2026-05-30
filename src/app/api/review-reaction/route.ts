import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

const VALID_REACTIONS = ['fire', 'helpful', 'love_this', 'disappointing'] as const;
type Reaction = typeof VALID_REACTIONS[number];

const REACTION_EMOJI: Record<Reaction, string> = {
  fire:         '🔥',
  helpful:      '👍',
  love_this:    '❤️',
  disappointing:'😬',
};

export async function POST(request: NextRequest) {
  try {
    const { reviewId, userId, reaction } = await request.json();

    if (!reviewId || !userId || !reaction) {
      return NextResponse.json({ error: 'Missing reviewId, userId, or reaction' }, { status: 400 });
    }

    if (!VALID_REACTIONS.includes(reaction as Reaction)) {
      return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Check if user already reacted with this reaction
    const { data: existing } = await (admin as any)
      .from('review_reactions')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .eq('reaction', reaction)
      .single();

    if (existing) {
      // Toggle off — delete the existing reaction
      await (admin as any)
        .from('review_reactions')
        .delete()
        .eq('id', existing.id);

      return NextResponse.json({ success: true, action: 'removed' });
    }

    // Insert the new reaction
    const { error: insertErr } = await (admin as any)
      .from('review_reactions')
      .insert({ review_id: reviewId, user_id: userId, reaction });

    if (insertErr) {
      console.error('Reaction insert error:', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Fetch the review author and business_id
    const { data: review } = await (admin as any)
      .from('reviews')
      .select('user_id, business_id')
      .eq('id', reviewId)
      .single();

    // Notify the review author if they are not the one reacting
    if (review?.user_id && review.user_id !== userId) {
      const [{ data: business }, { data: reactor }] = await Promise.all([
        (admin as any).from('businesses').select('slug, name').eq('id', review.business_id).single(),
        (admin as any).from('profiles').select('display_name').eq('id', userId).single(),
      ]);

      const reactorName = reactor?.display_name || 'Someone';
      const businessName = business?.name || 'a business';
      const link = `/business/${business?.slug || ''}#review-${reviewId}`;

      await (admin as any)
        .from('notifications')
        .insert({
          user_id: review.user_id,
          type: 'reaction',
          message: `${reactorName} reacted to your review at ${businessName} with ${REACTION_EMOJI[reaction as Reaction]}`,
          link,
        });
    }

    return NextResponse.json({ success: true, action: 'added' });
  } catch (err: any) {
    console.error('review-reaction error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
