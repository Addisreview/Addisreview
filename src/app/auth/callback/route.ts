// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/';
  const type = requestUrl.searchParams.get('type');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const next = requestUrl.searchParams.get('next') || '/';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_DB_HOST!,
    process.env.NEXT_PUBLIC_DB_ANON!
  );

  // Handle email confirmation via token_hash (Supabase email confirmation links)
  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email',
    });

    if (!error) {
      return NextResponse.redirect(new URL(next === '/' ? '/' : next, request.url));
    }
  }

  // Handle OAuth and magic link codes
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);

    // Password recovery
    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/auth/reset-password', request.url));
    }

    return NextResponse.redirect(new URL(redirect, request.url));
  }

  // Fallback — go home
  return NextResponse.redirect(new URL('/', request.url));
}
