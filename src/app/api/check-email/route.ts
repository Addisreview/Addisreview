import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ exists: false });

    const admin = createAdminClient();

    // Search by email directly — much faster than listing all users
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });

    if (error) return NextResponse.json({ exists: false });

    const exists = data.users.some(
      u => u.email?.toLowerCase() === email.trim().toLowerCase()
    );

    return NextResponse.json({ exists });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
