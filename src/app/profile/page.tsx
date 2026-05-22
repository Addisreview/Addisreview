'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { User } from '@supabase/supabase-js';
import { timeAgo } from '@/lib/utils';

interface Review {
  id: string;
  business_id: string;
  rating: number;
  body: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  businesses?: { name: string; slug: string; category_name: string; cover_photo_url: string | null };
}

// ── Skeleton components ───────────────────────────────────
function SkeletonPulse({ width = '100%', height = '16px', borderRadius = '8px', style = {} }: {
  width?: string; height?: string; borderRadius?: string; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, #f0ebe3 25%, #e8ddd0 50%, #f0ebe3 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style,
    }} />
  );
}

function ProfileSkeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <Navbar />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 5vw 80px' }}>
        {/* Header skeleton */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px',
          marginBottom: '40px', padding: '28px',
          background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        }}>
          <SkeletonPulse width="72px" height="72px" borderRadius="50%" />
          <div style={{ flex: 1 }}>
            <SkeletonPulse width="180px" height="22px" style={{ marginBottom: '10px' }} />
            <SkeletonPulse width="140px" height="14px" />
          </div>
        </div>

        {/* Reviews skeleton */}
        <SkeletonPulse width="160px" height="20px" style={{ marginBottom: '20px' }} />
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: '#fff', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', marginBottom: '16px', overflow: 'hidden',
            display: 'flex',
          }}>
            <div style={{ width: '80px', minWidth: '80px', background: '#f0ebe3' }} />
            <div style={{ padding: '20px', flex: 1 }}>
              <SkeletonPulse width="60%" height="16px" style={{ marginBottom: '10px' }} />
              <SkeletonPulse width="40%" height="12px" style={{ marginBottom: '10px' }} />
              <SkeletonPulse width="90%" height="12px" style={{ marginBottom: '6px' }} />
              <SkeletonPulse width="75%" height="12px" />
            </div>
          </div>
        ))}
      </main>
      <Footer />
    </>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth?redirect=/profile');
        return;
      }

      // Fire auth set + data fetch in parallel — no waterfall
      const [, { data: reviewData }] = await Promise.all([
        Promise.resolve(setUser(user)),
        (supabase
          .from('reviews')
          .select('*, businesses(name, slug, category_name, cover_photo_url)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }) as any),
      ]);

      setReviews(reviewData || []);
      setLoading(false);
    }

    load();
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    await (supabase.from('reviews') as any).delete().eq('id', reviewId);
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  if (loading) return <ProfileSkeleton />;

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 5vw 80px' }}>

        {/* Profile Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px',
          padding: '28px', background: '#fff', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'var(--green)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: 700, flexShrink: 0,
            }}>
              {initial}
            </div>
          )}
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 900, marginBottom: '4px' }}>
              {displayName}
            </h1>
            <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>
              {user?.email} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>
          My Reviews
        </h2>

        {reviews.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px', background: '#fff',
            borderRadius: 'var(--radius)', border: '1px solid var(--border)', color: 'var(--muted)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '8px' }}>No reviews yet</div>
            <div style={{ fontSize: '.9rem', marginBottom: '24px' }}>Share your experience with the community</div>
            <Link href="/search">
              <button className="btn-primary">Find a Business to Review</button>
            </Link>
          </div>
        ) : reviews.map(review => {
          const biz = review.businesses;
          const fullStars = review.rating;
          const emptyStars = 5 - fullStars;
          return (
            <div key={review.id} style={{
              background: '#fff', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', marginBottom: '16px', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                {/* Business photo/emoji strip */}
                {biz && (
                  <div style={{
                    width: '80px', minWidth: '80px',
                    background: biz.cover_photo_url
                      ? 'transparent'
                      : 'linear-gradient(135deg,#1a5c3a,#2d8657)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', overflow: 'hidden', flexShrink: 0,
                  }}>
                    {biz.cover_photo_url ? (
                      <img src={biz.cover_photo_url} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : '🏢'}
                  </div>
                )}

                <div style={{ padding: '18px', flex: 1, minWidth: 0 }}>
                  {biz && (
                    <Link href={`/business/${biz.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--charcoal)', marginBottom: '4px' }}>
                        {biz.name}
                      </div>
                      <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '8px' }}>
                        {biz.category_name}
                      </div>
                    </Link>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="stars" style={{ fontSize: '.95rem' }}>
                      {'★'.repeat(fullStars)}{'☆'.repeat(emptyStars)}
                    </span>
                    <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
                      {timeAgo(review.created_at)}
                    </span>
                  </div>

                  <p style={{ fontSize: '.88rem', lineHeight: 1.6, color: '#333', marginBottom: '10px' }}>
                    {review.body}
                  </p>

                  {review.tags && review.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      {review.tags.map(tag => (
                        <span key={tag} className="badge badge-green" style={{ fontSize: '.7rem' }}>{tag}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link href={`/write-review?business=${review.business_id}&edit=true`}>
                      <button style={{
                        background: 'none', border: '1px solid var(--border)',
                        borderRadius: '50px', padding: '5px 14px', fontSize: '.78rem',
                        fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                        color: 'var(--charcoal)',
                      }}>
                        ✏️ Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      style={{
                        background: 'none', border: '1px solid #fdecea',
                        borderRadius: '50px', padding: '5px 14px', fontSize: '.78rem',
                        fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                        color: 'var(--red)',
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>
      <Footer />
    </>
  );
}
