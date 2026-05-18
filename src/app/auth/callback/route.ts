import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
 
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/';
  const type = requestUrl.searchParams.get('type');
 
  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_DB_HOST!,
      process.env.NEXT_PUBLIC_DB_ANON!
    );
 
    await supabase.auth.exchangeCodeForSession(code);
 
    // Password recovery — send to a reset password page
    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/auth/reset-password', request.url));
    }
 
    return NextResponse.redirect(new URL(redirect, request.url));
  }
 
  // No code — just go home
  return NextResponse.redirect(new URL('/', request.url));
}
