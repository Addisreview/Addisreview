import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/';
 
  if (code) {
    // Pass code to client-side page to exchange for session
    return NextResponse.redirect(
      new URL(`/auth/confirm?code=${code}&redirect=${encodeURIComponent(redirect)}`, request.url)
    );
  }
 
  return NextResponse.redirect(new URL(redirect, request.url));
}
