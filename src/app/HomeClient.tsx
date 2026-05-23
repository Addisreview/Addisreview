'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BusinessCard from '@/components/business/BusinessCard';
import { createBrowserClient } from '@/lib/supabase';
import type { Business, City, Category } from '@/types/database';

// ── 5 visible filters only ────────────────────────────────
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

interface NearbyBusiness {
  id: string;
  name: string;
  slug: string;
  category_name: string;
  city_name: string;
  address: string;
  cover_photo_url: string | null;
  google_rating: number;
  review_count: number;
  lat: number;
  lng: number;
  distance_km: number;
}

interface Props {
  businesses: Business[];
  cities: City[];
  categories: Category[];
}

export default function HomeClient({ businesses, cities, categories }: Props) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [searchQ, setSearchQ] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Near You state
  const [nearbyBusinesses, setNearbyBusinesses] = useState<NearbyBusiness[]>([]);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'denied' | 'error'>('idle');

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
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
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const { data, error } = await (supabase as any).rpc('nearby_businesses', {
          user_lat: latitude,
          user_lng: longitude,
          radius_km: 5,
          limit_count: 12,
        });

        if (error) {
          setLocationStatus('error');
          return;
        }

        setNearbyBusinesses(data || []);
        setLocationStatus('success');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('denied');
        } else {
          setLocationStatus('error');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const formatDistance = (km: number) => {
    if (km < 1) return `${Math.round(km * 1000)}m away`;
    return `${km.toFixed(1)}km away`;
  };

  return (
    <main>
      {/* HERO */}
      <div style={{
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
            fontSize: 'clamp(2.2rem,4.5vw,3.6rem)',
            fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '14px',
          }}>
            Discover the best of <em style={{ fontStyle: 'italic', color: 'var(--yellow)' }}>your city</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.68)', fontSize: '1.05rem', marginBottom: '36px', lineHeight: 1.65 }}>
            Restaurants, hotels, spas & shops — reviewed by real Ethiopians. Find trusted local businesses everywhere.
          </p>
          <div style={{
            display: 'flex', background: '#fff', borderRadius: '14px',
            overflow: 'hidden', boxShadow: '0 10px 50px rgba(0,0,0,.3)', maxWidth: '660px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 18px', flex: 1, borderRight: '1px solid var(--border)' }}>
              <input
                type="text"
                placeholder="Restaurants, coffee shops, hotels…"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ border: 'none', outline: 'none', fontSize: '.93rem', color: 'var(--charcoal)', width: '100%', padding: '17px 0', background: 'transparent' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 18px', flex: 1 }}>
              <span style={{ fontSize: '.93rem', color: 'var(--charcoal)', padding: '17px 0', userSelect: 'none' }}>
                📍 Addis Ababa
              </span>
            </div>
            <button onClick={handleSearch} className="btn-search">Search</button>
          </div>
        </div>
      </div>

      {/* CATEGORY FILTERS */}
      <div style={{ padding: '20px 5vw 16px', borderBottom: '1px solid var(--border)', background: '#fff' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setActiveCategory('All')}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: activeCategory === 'All' ? 'var(--green)' : '#fff',
              border: activeCategory === 'All' ? '1.5px solid var(--green)' : '1.5px solid var(--border)',
              borderRadius: '50px', padding: '9px 18px', fontSize: '.87rem',
              fontWeight: 500, cursor: 'pointer', transition: 'all .2s',
              color: activeCategory === 'All' ? '#fff' : 'var(--charcoal)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            🍽️ All
          </button>

          {VISIBLE_CATEGORIES.map(cat => (
            <div
              key={cat.name}
              style={{ position: 'relative' }}
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
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {cat.emoji} {cat.name}
                <span style={{ fontSize: '.85rem', opacity: 0.8, marginLeft: '1px' }}>▾</span>
              </button>

              {hoveredCategory === cat.name && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
                  background: '#fff', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '8px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  display: 'flex', flexDirection: 'column', gap: '2px',
                  minWidth: '200px',
                }}>
                  {cat.subcategories.map(sub => (
                    <button
                      key={sub}
                      onClick={() => {
                        const params = new URLSearchParams();
                        params.set('q', sub);
                        params.set('category', cat.name);
                        params.set('city', 'Addis Ababa');
                        router.push(`/search?${params.toString()}`);
                      }}
                      style={{
                        background: 'none', border: 'none', textAlign: 'left',
                        padding: '9px 12px', borderRadius: '8px', fontSize: '.87rem',
                        cursor: 'pointer', color: 'var(--charcoal)',
                        fontFamily: 'var(--font-sans)', fontWeight: 500,
                        transition: 'background .12s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div ref={moreRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: moreOpen ? 'var(--green)' : 'transparent',
                border: moreOpen ? '1.5px solid var(--green)' : '1.5px dashed var(--border)',
                borderRadius: '50px', padding: '9px 18px', fontSize: '.87rem',
                fontWeight: 500, cursor: 'pointer', transition: 'all .2s',
                color: moreOpen ? '#fff' : 'var(--muted)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              More categories {moreOpen ? '▴' : '▾'}
            </button>

            {moreOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 200,
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '12px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '4px', minWidth: '280px',
              }}>
                {MORE_CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setMoreOpen(false);
                      router.push(`/search?category=${encodeURIComponent(cat.name)}&city=Addis+Ababa`);
                    }}
                    style={{
                      background: 'none', border: 'none', textAlign: 'left',
                      padding: '10px 12px', borderRadius: '10px', fontSize: '.87rem',
                      cursor: 'pointer', color: 'var(--charcoal)',
                      fontFamily: 'var(--font-sans)', fontWeight: 500,
                      transition: 'background .12s', display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <span>{cat.emoji}</span> {cat.name}
                  </button>
                ))}
                <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px' }}>
                  <button
                    onClick={() => { setMoreOpen(false); router.push('/search?city=Addis+Ababa'); }}
                    style={{
                      background: 'var(--green)', color: '#fff', border: 'none',
                      borderRadius: '50px', padding: '9px 20px', fontSize: '.85rem',
                      fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', width: '100%',
                    }}
                  >
                    Browse all categories →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEAR YOU SECTION */}
      <div style={{ padding: '48px 5vw', background: 'var(--cream)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700 }}>
              📍 <span style={{ color: 'var(--green)' }}>Near You</span>
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--muted)', marginTop: '4px' }}>
              Businesses within 5km of your location
            </div>
          </div>
          {locationStatus === 'success' && nearbyBusinesses.length > 0 && (
            <button
              onClick={handleFindNearby}
              style={{
                background: 'none', border: '1.5px solid var(--border)',
                borderRadius: '50px', padding: '8px 18px',
                fontSize: '.82rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-sans)', color: 'var(--muted)',
              }}
            >
              🔄 Refresh
            </button>
          )}
        </div>

        {/* Idle state — prompt to share location */}
        {locationStatus === 'idle' && (
          <div style={{
            background: '#fff', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: '40px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗺️</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>
              Find businesses near you
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '24px', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto 24px' }}>
              Allow location access to see restaurants, cafes, and shops closest to where you are right now.
            </p>
            <button
              onClick={handleFindNearby}
              style={{
                background: 'var(--green)', color: '#fff', border: 'none',
                borderRadius: '50px', padding: '13px 28px',
                fontFamily: 'var(--font-sans)', fontWeight: 700,
                fontSize: '.95rem', cursor: 'pointer',
              }}
            >
              📍 Find Businesses Near Me
            </button>
          </div>
        )}

        {/* Loading */}
        {locationStatus === 'loading' && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '14px' }}>📡</div>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Getting your location…</div>
            <div style={{ fontSize: '.85rem' }}>This only takes a second</div>
          </div>
        )}

        {/* Denied */}
        {locationStatus === 'denied' && (
          <div style={{
            background: '#fff', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', padding: '32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔒</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              Location access denied
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
              To see nearby businesses, enable location access in your browser settings and try again.
            </p>
            <button
              onClick={handleFindNearby}
              style={{
                background: 'var(--green)', color: '#fff', border: 'none',
                borderRadius: '50px', padding: '11px 24px',
                fontFamily: 'var(--font-sans)', fontWeight: 700,
                fontSize: '.88rem', cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Error */}
        {locationStatus === 'error' && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>Couldn't get your location</div>
            <button onClick={handleFindNearby} style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: '50px', padding: '8px 20px', fontSize: '.85rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', marginTop: '8px' }}>
              Try Again
            </button>
          </div>
        )}

        {/* Success — no results */}
        {locationStatus === 'success' && nearbyBusinesses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '8px' }}>No businesses found within 5km</div>
            <div style={{ fontSize: '.88rem' }}>Try searching for a specific area instead</div>
          </div>
        )}

        {/* Success — show results */}
        {locationStatus === 'success' && nearbyBusinesses.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
            {nearbyBusinesses.map(biz => (
              <Link key={biz.id} href={`/business/${biz.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#fff', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)', transition: 'box-shadow .2s, transform .2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Photo */}
                  <div style={{
                    height: '160px', overflow: 'hidden', position: 'relative',
                    background: 'linear-gradient(135deg, #1a5c3a, #2d8657)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem',
                  }}>
                    {biz.cover_photo_url ? (
                      <img src={biz.cover_photo_url} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : '🏢'}
                    {/* Distance badge */}
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'rgba(0,0,0,.65)', color: '#fff',
                      borderRadius: '50px', padding: '4px 10px',
                      fontSize: '.72rem', fontWeight: 700,
                      backdropFilter: 'blur(4px)',
                    }}>
                      📍 {formatDistance(biz.distance_km)}
                    </div>
                  </div>
                  {/* Info */}
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 700, marginBottom: '4px', color: 'var(--charcoal)' }}>
                      {biz.name}
                    </div>
                    <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: '8px' }}>
                      {biz.category_name}
                    </div>
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
      <div style={{ padding: '56px 5vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700 }}>
            Top Picks in <span style={{ color: 'var(--green)' }}>Addis Ababa</span>
          </div>
          <Link href="/search?city=Addis+Ababa" style={{ color: 'var(--green)', fontWeight: 600, fontSize: '.9rem', textDecoration: 'none', borderBottom: '1px solid var(--green)' }}>
            See all →
          </Link>
        </div>
        {filteredBusinesses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '22px' }}>
            {filteredBusinesses.map(biz => (
              <BusinessCard key={biz.id} business={biz} />
            ))}
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

      {/* CITIES */}
      <div style={{ padding: '56px 5vw', background: 'var(--cream)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700, marginBottom: '28px' }}>
          Browse by <span style={{ color: 'var(--green)' }}>City</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '14px' }}>
          {cities.map(city => (
            <Link key={city.id} href={`/search?city=${encodeURIComponent(city.name)}`} style={{ textDecoration: 'none' }}>
              <div
                onMouseEnter={() => setHoveredCity(city.id)}
                onMouseLeave={() => setHoveredCity(null)}
                style={{
                  background: hoveredCity === city.id ? 'var(--green)' : '#fff',
                  borderRadius: '14px', padding: '20px 14px',
                  textAlign: 'center', border: `1px solid ${hoveredCity === city.id ? 'var(--green)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all .22s',
                  color: hoveredCity === city.id ? '#fff' : 'var(--charcoal)',
                }}
              >
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>{city.emoji}</span>
                <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{city.name}</div>
                <div style={{ fontSize: '.76rem', opacity: 0.65, marginTop: '3px' }}>
                  {city.place_count > 0 ? `${city.place_count.toLocaleString()}+ places` : 'Coming soon'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ padding: '56px 5vw', background: 'var(--green)' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700, color: '#fff', marginBottom: '28px' }}>
          How <span style={{ color: 'var(--yellow)' }}>AddisReview</span> works
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '20px' }}>
          {[
            { n: 1, title: 'Search your city', desc: 'Find restaurants, hotels, shops & services across every major Ethiopian city.' },
            { n: 2, title: 'Read real reviews', desc: "Honest ratings from Ethiopians who've actually visited the place." },
            { n: 3, title: 'Share your experience', desc: 'Write a review and help your community make better choices.' },
            { n: 4, title: 'Own a business?', desc: 'Claim your listing, reply to reviews, and grow your customer base — free.' },
          ].map(step => (
            <div key={step.n} style={{
              background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.14)',
              borderRadius: '14px', padding: '28px 22px', textAlign: 'center',
            }}>
              <div style={{
                width: '46px', height: '46px', background: 'var(--yellow)', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '1.05rem', color: 'var(--charcoal)', margin: '0 auto 14px',
              }}>{step.n}</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#fff', marginBottom: '8px' }}>{step.title}</h3>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.84rem', lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: 'var(--yellow)', padding: '52px 5vw',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
      }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 900, color: 'var(--charcoal)', maxWidth: '460px' }}>
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
