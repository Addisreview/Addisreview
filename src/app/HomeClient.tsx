'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BusinessCard from '@/components/business/BusinessCard';
import { createBrowserClient } from '@/lib/supabase';
import type { Business, City, Category } from '@/types/database';

const VISIBLE_CATEGORIES = [
  { name: 'Restaurants',            emoji: '🍛', subcategories: ['Delivery', 'Firfir', 'Injera & Wot', 'Grills', 'Seafood', 'Italian', 'Fast Food', 'Vegetarian'] },
  { name: 'Coffee & Buna',          emoji: '☕', subcategories: ['Traditional Buna', 'Specialty Coffee', 'Pastry & Cake', 'Tea Houses'] },
  { name: 'Hotels & Guesthouses',   emoji: '🏨', subcategories: ['Luxury', 'Boutique', 'Budget', 'Rooftop Pool', 'Airbnb Style', 'Family Run', 'With Breakfast'] },
  { name: 'Rooftop Bars & Lounges', emoji: '🌆', subcategories: ['Live Music', 'Cocktail Bars', 'Sports Bars', 'Nightclubs'] },
  { name: 'Spas',                   emoji: '💆', subcategories: ['Massage', 'Hair Salons', 'Nail Salons', 'Hammam', 'Skin Care'] },
];

const MORE_CATEGORIES = [
  { name: 'Juice Bars',    emoji: '🥤' },
  { name: 'Bakeries',      emoji: '🥐' },
  { name: 'Gyms',          emoji: '💪' },
  { name: 'Supermarkets',  emoji: '🛒' },
  { name: 'Shopping',      emoji: '🛍️' },
  { name: 'Healthcare',    emoji: '🏥' },
  { name: 'Entertainment', emoji: '🎵' },
  { name: 'Services',      emoji: '🔧' },
];

const NEIGHBORHOODS = [
  { name: 'Bole',   emoji: '✈️', desc: 'Expat hub & dining' },
  { name: 'CMC',    emoji: '🏘️', desc: 'Residential & local' },
  { name: 'Sarbet', emoji: '🌿', desc: 'Cafes & quiet streets' },
  { name: 'Gerji',  emoji: '🏙️', desc: 'Growing & vibrant' },
  { name: 'Ayat',   emoji: '🌅', desc: 'East side gems' },
  { name: 'Jemo',   emoji: '🛒', desc: 'Shopping & services' },
  { name: 'Mexico', emoji: '🚌', desc: 'Central & connected' },
  { name: 'Piassa', emoji: '🏛️', desc: 'Historic heart of Addis' },
];

interface NearbyBusiness {
  id: string; name: string; slug: string; category_name: string;
  city_name: string; address: string; cover_photo_url: string | null;
  google_rating: number; review_count: number; lat: number; lng: number; distance_km: number;
}

interface FeaturedReview {
  id: string;
  author_name: string;
  body: string;
  rating: number;
  business_id: string;
  businesses: { name: string; slug: string } | null;
}

interface Props {
  businesses: Business[];
  cities: City[];
  categories: Category[];
  featuredReview?: FeaturedReview | null;
}

export default function HomeClient({ businesses, cities, categories, featuredReview }: Props) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [searchQ, setSearchQ] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const [nearbyBusinesses, setNearbyBusinesses] = useState<NearbyBusiness[]>([]);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'denied' | 'error'>('idle');

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQ) params.set('q', searchQ);
    params.set('city', 'Addis Ababa');
    if (activeCategory !== 'All') params.set('category', activeCategory);
    router.push(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const filteredBusinesses = activeCategory === 'All'
    ? businesses
    : businesses.filter(b =>
        b.category_name === activeCategory ||
        (activeCategory === 'Hotels & Guesthouses' && (b.category_name === 'Hotels' || b.category_name === 'Guesthouses'))
      );

  const handleFindNearby = () => {
    if (!navigator.geolocation) { setLocationStatus('error'); return; }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const { data, error } = await (supabase as any).rpc('nearby_businesses', {
          user_lat: latitude, user_lng: longitude, radius_km: 5, limit_count: 12,
        });
        if (error) { setLocationStatus('error'); return; }
        setNearbyBusinesses(data || []);
        setLocationStatus('success');
      },
      (err) => setLocationStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error'),
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const formatDistance = (km: number) =>
    km < 1 ? `${Math.round(km * 1000)}m away` : `${km.toFixed(1)}km away`;

  // Truncate review body to ~180 chars for display
  const truncateReview = (text: string, max = 180) =>
    text.length <= max ? text : text.slice(0, max).replace(/\s+\S*$/, '') + '…';

  // Get initials from author name
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <main>
      <style>{`
        @media (max-width: 768px) {
          .home-hero { padding: 48px 5vw 56px !important; }
          .home-search-bar { flex-direction: column !important; border-radius: 12px !important; }
          .home-search-bar > div { border-right: none !important; border-bottom: 1px solid var(--border) !important; }
          .home-search-bar .btn-search { width: 100% !important; min-height: 48px !important; }
          .category-filters-wrap { flex-wrap: nowrap !important; overflow-x: auto !important; padding-bottom: 6px !important; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .category-filters-wrap::-webkit-scrollbar { display: none; }
          .category-filters-wrap > * { flex-shrink: 0 !important; }
          .biz-grid { grid-template-columns: 1fr !important; }
          .nearby-grid { grid-template-columns: 1fr !important; }
          .neighborhoods-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .how-it-works-grid { grid-template-columns: 1fr 1fr !important; }
          .cta-section { flex-direction: column !important; text-align: center !important; align-items: center !important; }
          .section-pad { padding: 36px 5vw !important; }
          .section-title { font-size: 1.5rem !important; }
        }
        @media (max-width: 480px) {
          .how-it-works-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* HERO */}
      <div className="home-hero" style={{
        background: 'linear-gradient(140deg,#0e3d26 0%,var(--green) 50%,#1a7a4a 100%)',
        padding: '80px 5vw 88px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(245,197,24,.15)', border: '1px solid rgba(245,197,24,.3)',
            borderRadius: '50px', padding: '6px 16px', color: 'var(--yellow)',
            fontSize: '.78rem', fontWeight: 600, letterSpacing: '1.2px',
            textTransform: 'uppercase', marginBottom: '20px',
          }}>
            🇪🇹 Made for Ethiopia
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem,4.5vw,3.6rem)',
            fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '14px',
          }}>
            Discover the best of <em style={{ fontStyle: 'italic', color: 'var(--yellow)' }}>Addis Ababa</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.68)', fontSize: 'clamp(.9rem,2vw,1.05rem)', marginBottom: '32px', lineHeight: 1.65 }}>
            Restaurants, hotels, spas & shops — reviewed by real Ethiopians. Find trusted local businesses in Addis Ababa.
          </p>
          <div className="home-search-bar" style={{
            display: 'flex', background: '#fff', borderRadius: '14px',
            overflow: 'hidden', boxShadow: '0 10px 50px rgba(0,0,0,.3)', maxWidth: '660px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 18px', flex: 1, borderRight: '1px solid var(--border)' }}>
              <input
                type="text"
                placeholder="Restaurants, coffee shops, hotels…"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ border: 'none', outline: 'none', fontSize: '.93rem', color: 'var(--charcoal)', width: '100%', padding: '17px 0', background: 'transparent' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 18px', flex: 1 }}>
              <span style={{ fontSize: '.93rem', color: 'var(--charcoal)', padding: '17px 0', userSelect: 'none' }}>
                📍 Addis Ababa
              </span>
            </div>
            <button onClick={handleSearch} className="btn-search">Search</button>
          </div>
        </div>
      </div>

      {/* FEATURED REVIEW SNIPPET */}
      {featuredReview && (
        <div style={{ background: 'var(--warm-white)', borderBottom: '1px solid var(--border)', padding: '20px 5vw' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              ⭐ What people are saying
            </div>
            <Link href={`/business/${featuredReview.businesses?.slug || featuredReview.business_id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', borderRadius: '14px', border: '1px solid var(--border)',
                padding: '18px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start',
                transition: 'box-shadow .2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* Avatar */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                  background: 'var(--green)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '.85rem',
                }}>
                  {getInitials(featuredReview.author_name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#f5a623', fontSize: '.9rem' }}>{'★'.repeat(featuredReview.rating)}</span>
                    <span style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--charcoal)' }}>{featuredReview.author_name}</span>
                    <span style={{ fontSize: '.82rem', color: 'var(--muted)' }}>on</span>
                    <span style={{ fontSize: '.82rem', color: 'var(--green)', fontWeight: 600 }}>{featuredReview.businesses?.name}</span>
                  </div>
                  <p style={{ fontSize: '.9rem', color: 'var(--charcoal)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                    "{truncateReview(featuredReview.body)}"
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* CATEGORY FILTERS */}
      <div style={{ padding: '16px 5vw', borderBottom: '1px solid var(--border)', background: '#fff' }}>
        <div className="category-filters-wrap" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveCategory('All')}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: activeCategory === 'All' ? 'var(--green)' : '#fff',
              border: activeCategory === 'All' ? '1.5px solid var(--green)' : '1.5px solid var(--border)',
              borderRadius: '50px', padding: '9px 18px', fontSize: '.87rem',
              fontWeight: 500, cursor: 'pointer', transition: 'all .2s',
              color: activeCategory === 'All' ? '#fff' : 'var(--charcoal)',
              fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
            }}
          >
            🍽️ All
          </button>

          {VISIBLE_CATEGORIES.map(cat => (
            <div key={cat.name} style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredCategory(cat.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <button
                onClick={() => setActiveCategory(cat.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  background: activeCategory === cat.name ? 'var(--green)' : '#fff',
                  border: activeCategory === cat.name ? '1.5px solid var(--green)' : '1.5px solid var(--border)',
                  borderRadius: '50px', padding: '9px 18px', fontSize: '.87rem',
                  fontWeight: 500, cursor: 'pointer', transition: 'all .2s',
                  color: activeCategory === cat.name ? '#fff' : 'var(--charcoal)',
                  fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
                }}
              >
                {cat.emoji} {cat.name} <span style={{ fontSize: '.85rem', opacity: 0.8 }}>▾</span>
              </button>

              {hoveredCategory === cat.name && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
                  background: '#fff', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '8px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '200px',
                }}>
                  {cat.subcategories.map(sub => (
                    <button key={sub}
                      onClick={() => { router.push(`/search?q=${encodeURIComponent(sub)}&category=${encodeURIComponent(cat.name)}&city=Addis+Ababa`); }}
                      style={{ background: 'none', border: 'none', textAlign: 'left', padding: '9px 12px', borderRadius: '8px', fontSize: '.87rem', cursor: 'pointer', color: 'var(--charcoal)', fontFamily: 'var(--font-sans)', fontWeight: 500 }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >{sub}</button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div ref={moreRef} style={{ position: 'relative' }}>
            <button onClick={() => setMoreOpen(!moreOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: moreOpen ? 'var(--green)' : 'transparent',
                border: moreOpen ? '1.5px solid var(--green)' : '1.5px dashed var(--border)',
                borderRadius: '50px', padding: '9px 18px', fontSize: '.87rem',
                fontWeight: 500, cursor: 'pointer', transition: 'all .2s',
                color: moreOpen ? '#fff' : 'var(--muted)',
                fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
              }}
            >
              More {moreOpen ? '▴' : '▾'}
            </button>

            {moreOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 200,
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '12px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '4px', minWidth: '260px',
              }}>
                {MORE_CATEGORIES.map(cat => (
                  <button key={cat.name}
                    onClick={() => { setMoreOpen(false); router.push(`/search?category=${encodeURIComponent(cat.name)}&city=Addis+Ababa`); }}
                    style={{ background: 'none', border: 'none', textAlign: 'left', padding: '10px 12px', borderRadius: '10px', fontSize: '.87rem', cursor: 'pointer', color: 'var(--charcoal)', fontFamily: 'var(--font-sans)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <span>{cat.emoji}</span> {cat.name}
                  </button>
                ))}
                <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px' }}>
                  <button onClick={() => { setMoreOpen(false); router.push('/search?city=Addis+Ababa'); }}
                    style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '50px', padding: '9px 20px', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', width: '100%' }}>
                    Browse all categories →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEAR YOU */}
      <div className="section-pad" style={{ padding: '48px 5vw', background: 'var(--cream)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700 }}>
              📍 <span style={{ color: 'var(--green)' }}>Near You</span>
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--muted)', marginTop: '4px' }}>Businesses within 5km of your location</div>
          </div>
          {locationStatus === 'success' && nearbyBusinesses.length > 0 && (
            <button onClick={handleFindNearby} style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: '50px', padding: '8px 18px', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--muted)' }}>
              🔄 Refresh
            </button>
          )}
        </div>

        {locationStatus === 'idle' && (
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗺️</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>Find businesses near you</h3>
            <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '24px', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto 24px' }}>
              Allow location access to see restaurants, cafes, and shops closest to where you are right now.
            </p>
            <button onClick={handleFindNearby} style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '50px', padding: '13px 28px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '.95rem', cursor: 'pointer' }}>
              📍 Find Businesses Near Me
            </button>
          </div>
        )}

        {locationStatus === 'loading' && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '14px' }}>📡</div>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Getting your location…</div>
            <div style={{ fontSize: '.85rem' }}>This only takes a second</div>
          </div>
        )}

        {locationStatus === 'denied' && (
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔒</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Location access denied</h3>
            <p style={{ color: 'var(--muted)', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '20px' }}>Enable location access in your browser settings and try again.</p>
            <button onClick={handleFindNearby} style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '50px', padding: '11px 24px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer' }}>Try Again</button>
          </div>
        )}

        {locationStatus === 'error' && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>Couldn't get your location</div>
            <button onClick={handleFindNearby} style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: '50px', padding: '8px 20px', fontSize: '.85rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', marginTop: '8px' }}>Try Again</button>
          </div>
        )}

        {locationStatus === 'success' && nearbyBusinesses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '8px' }}>No businesses found within 5km</div>
            <div style={{ fontSize: '.88rem' }}>Try searching for a specific area instead</div>
          </div>
        )}

        {locationStatus === 'success' && nearbyBusinesses.length > 0 && (
          <div className="nearby-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {nearbyBusinesses.map(biz => (
              <Link key={biz.id} href={`/business/${biz.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ height: '160px', overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #1a5c3a, #2d8657)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                    {biz.cover_photo_url ? <img src={biz.cover_photo_url} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏢'}
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,.65)', color: '#fff', borderRadius: '50px', padding: '4px 10px', fontSize: '.72rem', fontWeight: 700 }}>
                      📍 {formatDistance(biz.distance_km)}
                    </div>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 700, marginBottom: '4px', color: 'var(--charcoal)' }}>{biz.name}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: '8px' }}>{biz.category_name}</div>
                    {biz.google_rating > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.82rem' }}>
                        <span style={{ color: '#f5a623' }}>★</span>
                        <span style={{ fontWeight: 700 }}>{biz.google_rating.toFixed(1)}</span>
                        <span style={{ color: 'var(--muted)' }}>Google</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* TOP PICKS */}
      <div className="section-pad" style={{ padding: '56px 5vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '12px' }}>
          <div className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700 }}>
            Top Picks in <span style={{ color: 'var(--green)' }}>Addis Ababa</span>
          </div>
          <Link href="/search?city=Addis+Ababa" style={{ color: 'var(--green)', fontWeight: 600, fontSize: '.9rem', textDecoration: 'none', borderBottom: '1px solid var(--green)', whiteSpace: 'nowrap' }}>
            See all →
          </Link>
        </div>
        {filteredBusinesses.length > 0 ? (
          <div className="biz-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '22px' }}>
            {filteredBusinesses.map(biz => <BusinessCard key={biz.id} business={biz} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>No businesses yet in this category</div>
            <div style={{ marginTop: '16px' }}>
              <Link href={`/search?category=${encodeURIComponent(activeCategory)}&city=Addis+Ababa`}>
                <button className="btn-primary">Search {activeCategory}</button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* BROWSE BY NEIGHBORHOOD */}
      <div className="section-pad" style={{ padding: '56px 5vw', background: 'var(--cream)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ marginBottom: '28px' }}>
          <div className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700, marginBottom: '8px' }}>
            Browse by <span style={{ color: 'var(--green)' }}>Neighborhood</span>
          </div>
          <div style={{ fontSize: '.88rem', color: 'var(--muted)' }}>Explore the best businesses in every corner of Addis Ababa</div>
        </div>
        <div className="neighborhoods-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px' }}>
          {NEIGHBORHOODS.map(n => (
            <Link key={n.name} href={`/search?neighborhood=${encodeURIComponent(n.name)}&city=Addis+Ababa`} style={{ textDecoration: 'none' }}>
              <div
                onMouseEnter={() => setHoveredNeighborhood(n.name)}
                onMouseLeave={() => setHoveredNeighborhood(null)}
                style={{
                  background: hoveredNeighborhood === n.name ? 'var(--green)' : '#fff',
                  borderRadius: '14px', padding: '20px 14px', textAlign: 'center',
                  border: `1px solid ${hoveredNeighborhood === n.name ? 'var(--green)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all .22s',
                  color: hoveredNeighborhood === n.name ? '#fff' : 'var(--charcoal)',
                }}
              >
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>{n.emoji}</span>
                <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{n.name}</div>
                <div style={{ fontSize: '.76rem', opacity: 0.65, marginTop: '3px' }}>{n.desc}</div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '.83rem', color: 'var(--muted)' }}>
          🌍 Expanding to <strong>Hawassa, Gondar, Dire Dawa</strong> & more cities soon
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="section-pad" style={{ padding: '56px 5vw', background: 'var(--green)' }}>
        <div className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700, color: '#fff', marginBottom: '28px' }}>
          How <span style={{ color: 'var(--yellow)' }}>AddisReview</span> works
        </div>
        <div className="how-it-works-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '20px' }}>
          {[
            { n: 1, title: 'Search your city', desc: 'Find restaurants, hotels, shops & services across every major Ethiopian city.' },
            { n: 2, title: 'Read real reviews', desc: "Honest ratings from Ethiopians who've actually visited the place." },
            { n: 3, title: 'Share your experience', desc: 'Write a review and help your community make better choices.' },
            { n: 4, title: 'Own a business?', desc: 'Claim your listing, reply to reviews, and grow your customer base — free.' },
          ].map(step => (
            <div key={step.n} style={{ background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.14)', borderRadius: '14px', padding: '28px 22px', textAlign: 'center' }}>
              <div style={{ width: '46px', height: '46px', background: 'var(--yellow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.05rem', color: 'var(--charcoal)', margin: '0 auto 14px' }}>{step.n}</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#fff', marginBottom: '8px' }}>{step.title}</h3>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.84rem', lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section" style={{ background: 'var(--yellow)', padding: '52px 5vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 900, color: 'var(--charcoal)', maxWidth: '460px' }}>
          Own a business in Ethiopia? List it for free.
        </h2>
        <Link href="/auth">
          <button className="btn-primary" style={{ padding: '16px 36px', fontSize: '1rem' }}>
            Add Your Business →
          </button>
        </Link>
      </div>
    </main>
  );
}
