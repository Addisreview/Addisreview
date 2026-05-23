'use client';

// src/app/claim/[businessId]/ClaimAuthGuard.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Business {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  category_name: string | null;
}

interface Props {
  businessId: string;
  business: Business;
}

// Dynamically import ClaimBusinessClient to pass user down
import dynamic from 'next/dynamic';
const ClaimBusinessClient = dynamic(() => import('./ClaimBusinessClient'), { ssr: false });

export default function ClaimAuthGuard({ businessId, business }: Props) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace(`/auth?redirect=/claim/${businessId}&reason=claim`);
        return;
      }
      setUser(data.user);
      setChecking(false);
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

  if (!user) return null;

  return <ClaimBusinessClient business={business} user={user} />;
}
