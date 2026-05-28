import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, firstName, lastName, nickname, gender, phone, avatarUrl } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'No user ID' }, { status: 400 });
    }

    const admin = createAdminClient();
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

    // 1. Get existing avatar from profiles table so we don't overwrite it if no new one was uploaded
    const { data: existingProfile, error: fetchError } = await (admin as any)
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch existing profile:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch existing profile' }, { status: 500 });
    }

    const existingAvatarUrl = existingProfile?.avatar_url || null;

    // Use new avatar if uploaded, otherwise keep the existing one
    const finalAvatarUrl = avatarUrl || existingAvatarUrl;

    // 2. Update auth user metadata
    const { error: authError } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: fullName || undefined,
        nickname: nickname || undefined,
        avatar_url: finalAvatarUrl || undefined,
      },
    });

    if (authError) {
      console.error('Auth metadata update error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // 3. Update profiles table — including display_name and avatar
    const { error: profileError } = await (admin as any)
      .from('profiles')
      .update({
        display_name: fullName || null,
        gender: gender || null,
        phone: phone || null,
        avatar_url: finalAvatarUrl || null,
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile table update error:', profileError);
    }

    // 4. Backfill author_name on all existing reviews
    if (fullName) {
      const { error: reviewError } = await (admin as any)
        .from('reviews')
        .update({ author_name: fullName })
        .eq('user_id', userId);

      if (reviewError) {
        console.error('Review author_name backfill error:', reviewError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('update-profile error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
