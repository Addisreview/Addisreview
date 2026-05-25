import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, firstName, lastName, nickname, gender, phone, avatarUrl } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'No user ID' }, { status: 400 });
    }

    const admin = createAdminClient();

    // 1. Update auth user metadata (First Name, Last Name, Nickname)
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    const { error: authError } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: fullName || undefined,
        nickname: nickname || undefined,
      },
    });

    if (authError) {
      console.error('Auth metadata update error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // 2. Update profiles table (gender, phone, avatar)
    const { error: profileError } = await (admin as any)
      .from('profiles')
      .update({
        gender: gender || null,
        phone: phone || null,
        avatar_url: avatarUrl || null,
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile table update error:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('update-profile error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
