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

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/auth?redirect=/profile');
        return;
      }
      setUser(data.user);

      // Fetch user's reviews with business info
      const { data: reviewData } = await (supabase
        .from('reviews')
        .select('*, businesses(name, slug, category_name, cover_photo_url)')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false }) as any);

      setReviews(reviewData || []);
      setLoading(false);
    });
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    await (supabase.from('reviews') as any).delete().eq('id', reviewId);
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
        <Footer />
      </>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 5vw 80px' }}>

        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', padding: '28px', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {initial}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700 }}>{displayName}</div>
            <div style={{ color: 'var(--muted)', fontSize: '.88rem', marginTop: '4px' }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
              <div style={{ fontSize: '.85rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--green)' }}>{reviews.length}</span>
                <span style={{ color: 'var(--muted)', marginLeft: '4px' }}>review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
            style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: '50px', padding: '8px 18px', fontSize: '.85rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--muted)', fontWeight: 600 }}
          >
            Sign Out
          </button>
        </div>

        {/* Reviews Section */}
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>
          Your Reviews
        </div>

        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
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
            <div key={review.id} style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
                {/* Business photo/emoji */}
                {biz && (
                  <div style={{ width: '80px', minWidth: '80px', background: 'linear-gradient(135deg,#1a5c3a,#2d8657)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                    {biz.cover_photo_url ? (
                      <img src={biz.cover_photo_url} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : '🏢'}
                  </div>
                )}
                <div style={{ padding: '16px 18px', flex: 1 }}>
                  {biz && (
                    <Link href={`/business/${biz.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '4px' }}>{biz.name}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--green)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '8px' }}>{biz.category_name}</div>
                    </Link>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="stars">{'★'.repeat(fullStars)}{'☆'.repeat(emptyStars)}</span>
                    <span style={{ fontWeight: 700, fontSize: '.88rem' }}>{review.rating}.0</span>
                    <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{timeAgo(review.created_at)}</span>
                  </div>
                  <p style={{ fontSize: '.88rem', color: '#333', lineHeight: 1.55, marginBottom: '10px' }}>{review.body}</p>
                  {review.tags && review.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                      {review.tags.map(tag => (
                        <span key={tag} className="badge badge-green" style={{ fontSize: '.72rem' }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {biz && (
                      <Link href={`/write-review?business=${review.business_id}&slug=${biz.slug}&name=${encodeURIComponent(biz.name)}`}>
                        <button style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '50px', padding: '5px 14px', fontSize: '.78rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--green)' }}>
                          ✏️ Edit
                        </button>
                      </Link>
                    )}
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '50px', padding: '5px 14px', fontSize: '.78rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--red)' }}
                    >
                      🗑 Delete
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
