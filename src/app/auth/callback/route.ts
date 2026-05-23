// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/';
  const type = requestUrl.searchParams.get('type') || '';
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const errorCode = requestUrl.searchParams.get('error_code');
  const errorDesc = requestUrl.searchParams.get('error_description');

  // If there's an error from Supabase
  if (errorCode) {
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorDesc || errorCode)}`, request.url)
    );
  }

  // Email confirmation or password recovery via token_hash
  if (tokenHash) {
    return NextResponse.redirect(
      new URL(`/auth/confirm?token_hash=${tokenHash}&type=${type}&redirect=${encodeURIComponent(redirect)}`, request.url)
    );
  }

  // OAuth code
  if (code) {
    return NextResponse.redirect(
      new URL(`/auth/confirm?code=${code}&type=${type}&redirect=${encodeURIComponent(redirect)}`, request.url)
    );
  }

  return NextResponse.redirect(new URL('/', request.url));
}
