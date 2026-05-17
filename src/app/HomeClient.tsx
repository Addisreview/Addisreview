'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BusinessCard from '@/components/business/BusinessCard';
import type { Business, City, Category } from '@/types/database';

const TOP_CATEGORIES = [
  {
    name: 'All',
    emoji: '🍽️',
    subcategories: [],
  },
  {
    name: 'Restaurants',
    emoji: '🍛',
    subcategories: ['Delivery', 'Firfir', 'Injera & Wot', 'Grills', 'Seafood', 'Italian', 'Fast Food', 'Vegetarian'],
  },
  {
    name: 'Coffee & Buna',
    emoji: '☕',
    subcategories: ['Traditional Buna', 'Specialty Coffee', 'Juice Bars', 'Pastry & Cake', 'Tea Houses'],
  },
  {
    name: 'Hotels',
    emoji: '🏨',
    subcategories: ['Luxury', 'Boutique', 'Guesthouses', 'Budget', 'Rooftop Pool'],
  },
  {
    name: 'Rooftop Bars & Lounges',
    emoji: '🌆',
    subcategories: ['Live Music', 'Cocktail Bars', 'Sports Bars', 'Nightclubs', 'Wine Bars'],
  },
  {
    name: 'Spas',
    emoji: '💆',
    subcategories: ['Massage', 'Hair Salons', 'Nail Salons', 'Hammam', 'Skin Care'],
  },
  {
    name: 'Shopping',
    emoji: '🛒',
    subcategories: ['Supermarkets', 'Traditional Markets', 'Fashion', 'Electronics', 'Bookstores'],
  },
  {
    name: 'Healthcare',
    emoji: '🏥',
    subcategories: ['Hospitals', 'Clinics', 'Pharmacies', 'Dental', 'Opticians'],
  },
  {
    name: 'Services',
    emoji: '🔧',
    subcategories: ['Electricians', 'Plumbers', 'Painters', 'Car Repair', 'Laundry', 'IT Support'],
  },
  {
    name: 'Gyms',
    emoji: '💪',
    subcategories: ['CrossFit', 'Swimming Pools', 'Yoga', 'Martial Arts', 'Boxing'],
  },
];

interface Props {
  businesses: Business[];
  cities: City[];
  categories: Category[];
}

export default function HomeClient({ businesses, cities, categories }: Props) {
  const router = useRouter();
  const [searchQ, setSearchQ] = useState('');
  const [searchLoc, setSearchLoc] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const handleSearch = (q?: string, cat?: string) => {
    const params = new URLSearchParams();
    if (q ?? searchQ) params.set('q', q ?? searchQ);
    if (searchLoc) params.set('city', searchLoc);
    const categoryToUse = cat ?? (activeCategory !== 'All' ? activeCategory : '');
    if (categoryToUse) params.set('category', categoryToUse);
    router.push(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const activeCatData = TOP_CATEGORIES.find(c => c.name === activeCategory);
  const subcategories = activeCatData?.subcategories ?? [];

  const filteredBusinesses = activeCategory === 'All'
    ? businesses
    : businesses.filter(b => b.category_name === activeCategory);

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
              <input
                type="text"
                placeholder="Addis Ababa, Gondar…"
                value={searchLoc}
                onChange={e => setSearchLoc(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ border: 'none', outline: 'none', fontSize: '.93rem', color: 'var(--charcoal)', width: '100%', padding: '17px 0', background: 'transparent' }}
              />
            </div>
            <button onClick={() => handleSearch()} className="btn-search">Search</button>
          </div>
        </div>
      </div>

      {/* CATEGORY PILLS + SUBCATEGORY ROW */}
      <div style={{ padding: '28px 5vw 0', borderBottom: '1px solid var(--border)', background: '#fff' }}>
        {/* Main category pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingBottom: '16px' }}>
          {TOP_CATEGORIES.map(cat => (
            <button
              key={cat.name}
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
            </button>
          ))}
          <Link href="/search" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'transparent', border: '1.5px dashed var(--border)',
              borderRadius: '50px', padding: '9px 18px', fontSize: '.87rem',
              fontWeight: 500, cursor: 'pointer', color: 'var(--muted)',
              fontFamily: 'var(--font-sans)',
            }}>
              More categories →
            </button>
          </Link>
        </div>

        {/* Subcategory chips — only shown when there are subcategories */}
        {subcategories.length > 0 && (
          <div style={{
            display: 'flex', gap: '8px', flexWrap: 'wrap',
            paddingBottom: '14px', paddingTop: '12px',
            borderTop: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: 'var(--muted)', alignSelf: 'center', marginRight: '4px' }}>
              Quick filters:
            </span>
            {subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => handleSearch(sub, activeCategory)}
                style={{
                  background: 'var(--cream)',
                  border: '1px solid var(--border)',
                  borderRadius: '50px',
                  padding: '5px 14px',
                  fontSize: '.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  color: 'var(--charcoal)',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all .15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLButtonElement).style.background = 'var(--green)';
                  (e.target as HTMLButtonElement).style.color = '#fff';
                  (e.target as HTMLButtonElement).style.borderColor = 'var(--green)';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLButtonElement).style.background = 'var(--cream)';
                  (e.target as HTMLButtonElement).style.color = 'var(--charcoal)';
                  (e.target as HTMLButtonElement).style.borderColor = 'var(--border)';
                }}
              >
                {sub}
              </button>
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
          <Link href="/search" style={{ color: 'var(--green)', fontWeight: 600, fontSize: '.9rem', textDecoration: 'none', borderBottom: '1px solid var(--green)' }}>
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
              <Link href={`/search?category=${encodeURIComponent(activeCategory)}`}>
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
