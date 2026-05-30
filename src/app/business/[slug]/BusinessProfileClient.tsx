'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ReviewCard from '@/components/reviews/ReviewCard';
import PhotoLightbox from '@/components/PhotoLightbox';
import type { Business, Review } from '@/types/database';
import { formatRating, priceLabel, getCategoryEmoji } from '@/lib/utils';
import { createBrowserClient } from '@/lib/supabase';

interface Props {
  business: Business;
  reviews: (Review & {
    profiles?: {
      display_name: string | null;
      full_name?: string | null;
      avatar_url: string | null
    } | null
  })[];
}

const HERO_COLORS: Record<string, string> = {
  'Restaurants': 'linear-gradient(135deg,#8B4513,#D2691E)',
  'Coffee & Buna': 'linear-gradient(135deg,#1a3d1a,#2e6b2e)',
  'Hotels': 'linear-gradient(135deg,#0e2a5c,#1e4f9e)',
  'Spas': 'linear-gradient(135deg,#3d1a6b,#7a3db5)',
  'Shopping': 'linear-gradient(135deg,#5c1a0e,#a83418)',
  'Entertainment': 'linear-gradient(135deg,#0a4a3a,#1a8a6a)',
  'Healthcare': 'linear-gradient(135deg,#1a3d5c,#2e6b9e)',
};

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

export default function BusinessProfileClient({ business, reviews }: Props) {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [activeTab, setActiveTab] = useState<'reviews'|'about'|'photos'>('reviews');
  const [imgError, setImgError] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Save feature
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const addPhotoInputRef = useRef<HTMLInputElement>(null);

  // Check if already saved
  useEffect(() => {
    async function checkSavedStatus() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('business_id', business.id)
        .single();

      setIsSaved(!!data);
    }
    checkSavedStatus();
  }, [business.id]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionUser(data.session?.user ?? null);
    });
  }, []);

  const handleAddPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('businessId', business.id);
      await fetch('/api/upload-business-photo', { method: 'POST', body: formData });
    }
    toast.success('Photos uploaded! They will appear after review.');
    if (addPhotoInputRef.current) addPhotoInputRef.current.value = '';
  };

  const toggleSave = async () => {
    if (saving) return;
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error('Please log in to save businesses');
      setSaving(false);
      return;
    }

    if (isSaved) {
      // Unsave
      const { error } = await (supabase
        .from('user_favorites') as any)
        .delete()
        .eq('user_id', session.user.id)
        .eq('business_id', business.id);

      if (!error) {
        setIsSaved(false);
        toast.success('Removed from My Collection');
      }
    } else {
      // Save
      const { error } = await (supabase
        .from('user_favorites') as any)
        .insert({
          user_id: session.user.id,
          business_id: business.id,
        });

      if (!error) {
        setIsSaved(true);
        toast.success('Added to My Collection ❤️');
      }
    }
    setSaving(false);
  };

  // ── Rating logic ──
  const addisRating = Number(business.rating_avg) || 0;
  const googleRating = Number(business.google_rating) || 0;
  const displayRating = addisRating > 0 ? addisRating : googleRating;
  const fullStars = Math.floor(displayRating);
  const emptyStars = 5 - fullStars;
  const emoji = getCategoryEmoji(business.category_name || '');
  const heroColor = HERO_COLORS[business.category_name || ''] || 'linear-gradient(135deg,#333,#555)';

  // ── Hours logic ──
  const rawHours = business.hours as Record<string, string> | null;
  const hours = rawHours && typeof rawHours === 'object' && !Array.isArray(rawHours) ? rawHours : null;
  const hasHours = hours && DAYS.some(d => hours[d] && hours[d].trim().length > 0);

  const photo = (business as any).cover_photo_url || null;
  const slug = business.slug || business.id;
  const writeReviewUrl = `/write-review?business=${business.id}&slug=${slug}&name=${encodeURIComponent(business.name)}`;
  const totalReviews = reviews.length;

  const ratingBuckets = [5,4,3,2,1].map(star => {
    const count = reviews.filter(r => Number(r.rating) === star).length;
    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, pct };
  });

  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  const allPhotos = [
    ...(photo ? [photo] : []),
    ...(business.photos || []),
    ...reviews.flatMap(r => (r as any).photo_urls || []),
  ];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextPhoto = () => setLightboxIndex(i => i === null ? 0 : (i + 1) % allPhotos.length);
  const prevPhoto = () => setLightboxIndex(i => i === null ? 0 : (i - 1 + allPhotos.length) % allPhotos.length);

  return (
    <main>
      <style>{`
        @media (max-width: 768px) {
          .biz-body-layout { grid-template-columns: 1fr !important; padding: 16px !important; }
          .biz-sidebar { order: -1; }
          .biz-hero { height: 280px !important; }
          .biz-hero-right { display: none !important; }
          .biz-hero-left { width: 100% !important; }
          .biz-header-inner { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .biz-actions { flex-wrap: wrap; width: 100%; }
          .biz-actions button { flex: 1; justify-content: center; }
          .biz-avatar { margin-top: -40px !important; width: 70px !important; height: 70px !important; font-size: 2rem !important; }
          .photos-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        .photo-thumb { cursor: pointer; transition: transform .2s, opacity .2s; }
        .photo-thumb:hover { transform: scale(1.03); opacity: .9; }
      `}</style>

      {lightboxIndex !== null && (
        <PhotoLightbox photos={allPhotos} initialIndex={lightboxIndex} currentIndex={lightboxIndex} onClose={closeLightbox} onNext={nextPhoto} onPrev={prevPhoto} />
      )}

      {/* HERO */}
      {allPhotos.length === 0 ? (
        <div className="biz-hero" style={{ height: '420px', background: heroColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8rem' }}>
          {emoji}
        </div>
      ) : allPhotos.length === 1 ? (
        <div className="biz-hero" style={{ height: '420px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={allPhotos[0]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(20px) brightness(0.7)', transform: 'scale(1.1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)' }} />
          <img src={allPhotos[0]} alt={business.name} onClick={() => openLightbox(0)} style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }} />
        </div>
      ) : allPhotos.length <= 4 ? (
        <div className="biz-hero" style={{ height: '420px', display: 'flex', overflow: 'hidden' }}>
          <div className="biz-hero-left" style={{ width: '60%', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={allPhotos[0]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(20px) brightness(0.7)', transform: 'scale(1.1)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)' }} />
            <img src={allPhotos[0]} alt={business.name} onClick={() => openLightbox(0)} style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }} />
          </div>
          <div className="biz-hero-right" style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '2px' }}>
            {allPhotos.slice(1).map((url, i) => (
              <div key={i} style={{ flex: 1, overflow: 'hidden' }}>
                <img src={url} alt="" onClick={() => openLightbox(i + 1)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="biz-hero" style={{ height: '420px', display: 'flex', overflow: 'hidden' }}>
          <div className="biz-hero-left" style={{ width: '60%', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={allPhotos[0]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(20px) brightness(0.7)', transform: 'scale(1.1)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)' }} />
            <img src={allPhotos[0]} alt={business.name} onClick={() => openLightbox(0)} style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }} />
          </div>
          <div className="biz-hero-right" style={{ width: '40%', position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '2px', marginLeft: '2px' }}>
            {allPhotos.slice(1, 5).map((url, i) => (
              <div key={i} style={{ overflow: 'hidden' }}>
                <img src={url} alt="" onClick={() => openLightbox(i + 1)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', display: 'block' }} />
              </div>
            ))}
            <button onClick={() => openLightbox(0)} style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,.7)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: '50px', padding: '7px 14px', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)', zIndex: 2 }}>
              📷 See all {allPhotos.length} photos
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 5vw' }}>
        <div className="biz-header-inner" style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', padding: '24px 0', flexWrap: 'wrap' }}>
          <div className="biz-avatar" style={{ width: '90px', height: '90px', background: photo && !imgError ? 'transparent' : heroColor, borderRadius: '16px', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', marginTop: '-50px', position: 'relative', zIndex: 2, boxShadow: 'var(--shadow-md)', flexShrink: 0, overflow: 'hidden' }}>
            {photo && !imgError ? <img src={photo} alt={business.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '6px' }}>{business.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="stars" style={{ fontSize: '1.1rem' }}>{'★'.repeat(fullStars)}{'☆'.repeat(emptyStars)}</span>
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>{formatRating(displayRating)}</span>
                <span style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
                  {addisRating > 0
                    ? `(${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'} on AddisReview)`
                    : `(${(business as any).google_review_count || 'Google'} reviews · Google)`
                  }
                </span>
              </div>
              {addisRating === 0 && googleRating > 0 && (
                <span style={{ fontSize: '.78rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                  Be the first to review on AddisReview
                </span>
              )}
              {business.is_featured && <span className="badge badge-featured">⭐ Featured</span>}
              {business.is_verified && <span className="badge badge-open">✓ Verified</span>}
              {business.category_name && <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{business.category_name}{business.price_range ? ` · ${priceLabel(business.price_range)}` : ''}</span>}
            </div>
          </div>

          <input ref={addPhotoInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleAddPhotos} />
          <div className="biz-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push(writeReviewUrl)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '50px', fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', background: 'var(--green)', color: '#fff', border: 'none', fontFamily: 'var(--font-sans)' }}>
              ✏️ Write a Review
            </button>

            {/* REAL SAVE BUTTON */}
            <button
              onClick={toggleSave}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '10px 18px', borderRadius: '50px', fontSize: '.88rem',
                fontWeight: 600, cursor: 'pointer', background: '#fff',
                color: 'var(--charcoal)', border: '1.5px solid var(--border)',
                fontFamily: 'var(--font-sans)'
              }}
            >
              {isSaved ? '❤️' : '♡'}
              {isSaved ? 'Saved' : 'Save'}
            </button>

            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '50px', fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', background: '#fff', color: 'var(--charcoal)', border: '1.5px solid var(--border)', fontFamily: 'var(--font-sans)' }}>
              ↑ Share
            </button>

            {sessionUser && (
              <button onClick={() => addPhotoInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '50px', fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', background: '#fff', color: 'var(--charcoal)', border: '1.5px solid var(--border)', fontFamily: 'var(--font-sans)' }}>
                📷 Add Photos
              </button>
            )}
            {!(business as any).is_claimed && (
              <button onClick={() => router.push(`/claim/${business.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '50px', fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', background: 'var(--yellow)', color: 'var(--charcoal)', border: 'none', fontFamily: 'var(--font-sans)' }}>
                🏢 Claim this Business
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BODY - unchanged from your original */}
      <div className="biz-body-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '40px', padding: '40px 5vw', maxWidth: '1300px' }}>
        <div>
          <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '32px', overflowX: 'auto' }}>
            {(['reviews','about','photos'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '12px 22px', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', border: 'none', background: 'none', fontFamily: 'var(--font-sans)', borderBottom: activeTab === tab ? '2px solid var(--green)' : '2px solid transparent', marginBottom: '-2px', color: activeTab === tab ? 'var(--green)' : 'var(--muted)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'reviews' && (
            <>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', background: 'var(--cream)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '28px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontWeight: 900, color: 'var(--green)', lineHeight: 1 }}>
                    {addisRating > 0 ? formatRating(addisRating) : formatRating(googleRating)}
                  </div>
                  <div className="stars" style={{ fontSize: '1.2rem', margin: '6px 0' }}>{'★'.repeat(fullStars)}{'☆'.repeat(emptyStars)}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
                    {addisRating > 0 ? `${totalReviews} AddisReview ${totalReviews === 1 ? 'review' : 'reviews'}` : `${(business as any).google_review_count || '—'} Google reviews`}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  {ratingBuckets.map(({ star, count, pct }) => (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px', fontSize: '.83rem' }}>
                      <span style={{ width: '30px', textAlign: 'right', color: 'var(--muted)' }}>{star}★</span>
                      <div style={{ flex: 1, background: '#e8ddd0', borderRadius: '50px', height: '8px', overflow: 'hidden' }}>
                        <div className="bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ width: '28px', fontSize: '.78rem', color: 'var(--muted)' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '8px' }}>No AddisReview reviews yet</div>
                  <div style={{ fontSize: '.9rem', marginBottom: '8px' }}>
                    {googleRating > 0 && `This business has ${(business as any).google_review_count || 'many'} reviews on Google with a ${googleRating} rating.`}
                  </div>
                  <div style={{ fontSize: '.9rem', marginBottom: '24px' }}>Be the first to share your experience on AddisReview!</div>
                  <button className="btn-primary" onClick={() => router.push(writeReviewUrl)}>Write the First Review</button>
                </div>
              ) : reviews.map(review => <ReviewCard key={review.id} review={review} />)}

              <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
                <button className="btn-outline" onClick={() => router.push(writeReviewUrl)}>Write Your Own Review</button>
              </div>
            </>
          )}

          {activeTab === 'about' && (
            <div>
              {business.description && (
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '12px' }}>About</h3>
                  <p style={{ fontSize: '.95rem', lineHeight: 1.7, color: '#333' }}>{business.description}</p>
                </div>
              )}
              {business.features && business.features.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '12px' }}>Features & Highlights</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {business.features.map(f => <span key={f} className="badge badge-green">{f}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="photos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
              {allPhotos.length > 0 ? allPhotos.map((url, i) => (
                <img key={i} className="photo-thumb" src={url} alt="" onClick={() => openLightbox(i)}
                  style={{ borderRadius: '10px', width: '100%', height: '160px', objectFit: 'cover' }} />
              )) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📷</div>
                  <div>No photos yet</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="biz-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '22px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>Business Info</h3>
            {business.address && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '.88rem' }}>
                <span style={{ color: 'var(--green)', marginTop: '2px' }}>📍</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '2px' }}>Address</div>
                  <div style={{ lineHeight: 1.5 }}>{business.address}</div>
                </div>
              </div>
            )}
            {business.phone && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '.88rem' }}>
                <span style={{ color: 'var(--green)', marginTop: '2px' }}>📞</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '2px' }}>Phone</div>
                  <a href={`tel:${business.phone}`} style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>{business.phone}</a>
                </div>
              </div>
            )}
            {business.website && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '.88rem' }}>
                <span style={{ color: 'var(--green)', marginTop: '2px' }}>🌐</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '2px' }}>Website</div>
                  <a href={business.website} target="_blank" rel="noreferrer" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>Visit website</a>
                </div>
              </div>
            )}
            {hasHours && (
              <div style={{ display: 'flex', gap: '12px', fontSize: '.88rem' }}>
                <span style={{ color: 'var(--green)', marginTop: '2px' }}>🕐</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '8px' }}>Hours</div>
                  {DAYS.map(day => (
                    <div key={day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', padding: '5px 0', borderBottom: '1px solid #f0ebe3', color: day === today ? 'var(--green)' : 'inherit', fontWeight: day === today ? 700 : 400 }}>
                      <span style={{ textTransform: 'capitalize' }}>{day}</span>
                      <span>{hours![day] || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {business.lat && business.lng && (
            <a href={`https://maps.google.com?q=${business.lat},${business.lng}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'linear-gradient(135deg,#e8f5ee,#c8e0d0)', borderRadius: '12px', height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--green)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                🗺️
                <span style={{ fontSize: '.8rem', marginTop: '8px', fontWeight: 600, color: 'var(--green)' }}>View on Google Maps</span>
              </div>
            </a>
          )}

          {business.features && business.features.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '22px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>Highlights</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {business.features.map(f => <span key={f} className="badge badge-green">{f}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
