'use client';

// src/app/claim/[businessId]/ClaimAuthGuard.tsx
// Handles auth check on the client side to avoid server-side session cookie issues

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';

interface Props {
  businessId: string;
  children: React.ReactNode;
}

export default function ClaimAuthGuard({ businessId, children }: Props) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        // Not logged in — redirect to auth with return URL
        router.replace(`/auth?redirect=/claim/${businessId}&reason=claim`);
      } else {
        setAuthorized(true);
        setChecking(false);
      }
    });
  }, []);

  if (checking) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔐</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '.95rem' }}>Checking your account…</div>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
