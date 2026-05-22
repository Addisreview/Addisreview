'use client';

// src/app/dashboard/page.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { User } from '@supabase/supabase-js';
import type { Business } from '@/types/database';
import { getCategoryEmoji, formatRating, priceLabel } from '@/lib/utils';

const CARD_COLORS: Record<string, string> = {
  'Restaurants':   'linear-gradient(135deg,#6b2e0a,#c45e1e)',
  'Coffee & Buna': 'linear-gradient(135deg,#1a3d1a,#2e6b2e)',
  'Hotels':        'linear-gradient(135deg,#0e2a5c,#1e4f9e)',
  'Spas':          'linear-gradient(135deg,#3d1a6b,#7a3db5)',
  'Shopping':      'linear-gradient(135deg,#5c1a0e,#a83418)',
  'Entertainment': 'linear-gradient(135deg,#0a4a3a,#1a8a6a)',
  'Healthcare':    'linear-gradient(135deg,#1a3d5c,#2e6b9e)',
};

export default function OwnerDashboard() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/auth?redirect=/dashboard');
        return;
      }
      setUser(data.user);

      const { data: bizData } = await (supabase
        .from('businesses')
        .select('*')
        .eq('claimed_by', data.user.id)
        .eq('is_claimed', true) as any);

      setBusinesses(bizData || []);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <>
      <Navbar />
      <div style={{ padding: '80px', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
        {/* HEADER */}
        <div style={{ background: 'linear-gradient(135deg, #0e3d26, var(--green))', padding: '32px 5vw' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
              Owner Dashboard
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
              My Businesses
            </h1>
            <div style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.6)', marginTop: '4px' }}>
              {businesses.length} claimed {businesses.length === 1 ? 'business' : 'businesses'}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 5vw' }}>
          {businesses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏢</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 900, marginBottom: '12px' }}>
                No businesses yet
              </h2>
              <p style={{ color: 'var(--muted)', marginBottom: '32px', lineHeight: 1.6 }}>
                Find your business on AddisReview and claim it to manage your listing.
              </p>
              <Link href="/search">
                <button className="btn-primary">Find Your Business →</button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {businesses.map(biz => {
                const emoji = getCategoryEmoji(biz.category_name || '');
                const photo = biz.cover_photo_url || null;
                const bg = CARD_COLORS[biz.category_name || ''] || 'linear-gradient(135deg,#333,#555)';
                const rating = Number(biz.rating_avg) || Number(biz.google_rating) || 0;

                return (
                  <Link key={biz.id} href={`/dashboard/${biz.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card-hover" style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', overflow: 'hidden', cursor: 'pointer' }}>
                      {/* Photo */}
                      <div style={{ width: '160px', minWidth: '160px', background: photo ? 'transparent' : bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', position: 'relative', overflow: 'hidden' }}>
                        {photo ? (
                          <img src={photo} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        ) : emoji}
                      </div>

                      {/* Info */}
                      <div style={{ padding: '20px 24px', flex: 1 }}>
                        <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '4px' }}>
                          {biz.category_name}
                        </div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
                          {biz.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          {rating > 0 && (
                            <>
                              <span style={{ color: 'var(--yellow)', fontSize: '.9rem' }}>{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</span>
                              <span style={{ fontWeight: 700, fontSize: '.88rem' }}>{rating.toFixed(1)}</span>
                              <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>({biz.review_count} reviews)</span>
                            </>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '.82rem', color: 'var(--muted)', flexWrap: 'wrap' }}>
                          {biz.neighborhood && <span>📍 {biz.neighborhood}{biz.city_name ? `, ${biz.city_name}` : ''}</span>}
                          {biz.price_range && <span>💰 {priceLabel(biz.price_range)}</span>}
                          <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Verified Owner</span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', color: 'var(--muted)', fontSize: '1.2rem' }}>
                        →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
