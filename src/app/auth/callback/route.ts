import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    // PKCE flow - redirect to client to handle
    return NextResponse.redirect(new URL(`/?code=${code}`, request.url));
  }
  
  // Implicit flow - just go home, Supabase JS will handle the hash token
  return NextResponse.redirect(new URL('/', request.url));
}
