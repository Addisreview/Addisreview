'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';

function ConfirmAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  useEffect(() => {
    const code = searchParams.get('code');
    const redirect = searchParams.get('redirect') || '/';

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error('Auth error:', error);
          router.push('/auth');
        } else {
          router.push(redirect);
        }
      });
    } else {
      router.push('/');
    }
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '2rem' }}>🇪🇹</div>
      <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--muted)' }}>Signing you in…</div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading…</div>}>
      <ConfirmAuth />
    </Suspense>
  );
}
