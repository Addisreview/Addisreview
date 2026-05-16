'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { BusinessWithCount, Category, City } from '@/types/database';
import { formatRating, priceLabel, getCategoryEmoji } from '@/lib/utils';

interface Props {
  businesses: BusinessWithCount[];
  totalCount: number;
  categories: Category[];
  cities: Pick<City, 'id' | 'name' | 'emoji'>[];
  currentFilters: { q?: string; city?: string; category?: string; rating?: string; sort?: string };
  currentPage: number;
}

export default function SearchClient({ businesses, totalCount, categories, cities, currentFilters, currentPage }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(currentFilters.q || '');
  const [city, setCity] = useState(currentFilters.city || '');
  const [sort, setSort] = useState(currentFilters.sort || 'rating');
  const [selectedCat, setSelectedCat] = useState(currentFilters.category || '');
  const [selectedRating, setSelectedRating] = useState(currentFilters.rating || '0');
  const [selectedPrices, setSelectedPrices] = useState<number[]>([]);

  const push = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { q, city, category: selectedCat, rating: selectedRating, sort, ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    router.push(`/search?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <main>
      {/* ── SEARCH HEADER ── */}
      <div style={{ background: 'var(--green)', padding: '32px 5vw' }}>
        <div style={{ display: 'flex', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', maxWidth: '700px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', flex: 1, borderRight: '1px solid var(--border)' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: '#b0a090' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Restaurants, hotels…"
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && push({})}
              style={{ border: 'none', outline: 'none', fontSize: '.93rem', width: '100%', padding: '14px 0', background: 'transparent' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', flex: 1 }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: '#b0a090' }}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
            </svg>
            <input
              type="text"
              placeholder="City or area…"
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && push({})}
              style={{ border: 'none', outline: 'none', fontSize: '.93rem', width: '100%', padding: '14px 0', background: 'transparent' }}
            />
          </div>
          <button
            onClick={() => push({})}
            style={{ background: 'var(--yellow)', border: 'none', padding: '0 24px', fontFamily: 'var(--font-sans)', fontSize: '.95rem', fontWeight: 700, color: 'var(--charcoal)', cursor: 'pointer' }}
          >
            Search
          </button>
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', padding: '40px 5vw', maxWidth: '1300px' }}>

        {/* ── FILTERS ── */}
        <div style={{
          background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          padding: '24px', height: 'fit-content', position: 'sticky', top: '84px',
        }}>
          <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>Filters</div>

          {/* Category */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--muted)', marginBottom: '12px' }}>Category</div>
            {[{ name: '', label: 'All Categories' }, ...categories.map(c => ({ name: c.name, label: c.name }))].map(cat => (
              <label key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px', cursor: 'pointer', fontSize: '.88rem' }}>
                <input
                  type="radio"
                  name="cat"
                  checked={selectedCat === cat.name}
                  onChange={() => { setSelectedCat(cat.name); push({ category: cat.name }); }}
                  style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }}
                />
                {cat.label}
              </label>
            ))}
          </div>

          {/* Rating */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--muted)', marginBottom: '12px' }}>Minimum Rating</div>
            {[['0','Any rating'],['4','★★★★☆ 4+ stars'],['3','★★★☆☆ 3+ stars']].map(([val, label]) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px', cursor: 'pointer', fontSize: '.88rem' }}>
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === val}
                  onChange={() => { setSelectedRating(val); push({ rating: val }); }}
                  style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }}
                />
                {label}
              </label>
            ))}
          </div>

          {/* Price */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--muted)', marginBottom: '12px' }}>Price Range</div>
            {[[1,'$ (Budget)'],[2,'$$ (Moderate)'],[3,'$$$ (Upscale)'],[4,'$$$$ (Luxury)']].map(([val, label]) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px', cursor: 'pointer', fontSize: '.88rem' }}>
                <input
                  type="checkbox"
                  checked={selectedPrices.includes(Number(val))}
                  onChange={e => setSelectedPrices(prev => e.target.checked ? [...prev, Number(val)] : prev.filter(p => p !== Number(val)))}
                  style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }}
                />
                {label}
              </label>
            ))}
          </div>

          <button className="btn-primary" style={{ width: '100%', borderRadius: '10px' }} onClick={() => push({})}>
            Apply Filters
          </button>
          <button
            onClick={() => { setSelectedCat(''); setSelectedRating('0'); setSelectedPrices([]); setQ(''); setCity(''); push({ q:'', city:'', category:'', rating:'0' }); }}
            style={{ width: '100%', marginTop: '8px', padding: '10px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.85rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            Clear all filters
          </button>
        </div>

        {/* ── RESULTS ── */}
        <div>
          {/* Results header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '1rem', color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--charcoal)' }}>{totalCount.toLocaleString()} result{totalCount !== 1 ? 's' : ''}</strong>
              {currentFilters.q && ` for "${currentFilters.q}"`}
              {currentFilters.city && ` near ${currentFilters.city}`}
            </div>
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); push({ sort: e.target.value }); }}
              style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '8px 14px', fontSize: '.87rem', outline: 'none', color: 'var(--charcoal)', background: '#fff', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
            >
              <option value="rating">Best Match</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>

          {/* Results list */}
          {businesses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '8px' }}>No results found</div>
              <div style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '24px' }}>Try different keywords or a different city</div>
              <button className="btn-primary" onClick={() => push({ q:'', city:'', category:'', rating:'0' })}>Clear Search</button>
            </div>
          ) : businesses.map(biz => {
            const emoji = getCategoryEmoji(biz.category_name || '');
            const rating = Number(biz.rating_avg) || 0;
            const fullStars = Math.floor(rating);
            const emptyStars = 5 - fullStars;

            return (
              <Link key={biz.id} href={`/business/${biz.slug || biz.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="result-hover" style={{
                  background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                  display: 'flex', overflow: 'hidden', cursor: 'pointer', marginBottom: '18px',
                }}>
                  <div style={{
                    width: '160px', minWidth: '160px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '4rem',
                    background: 'linear-gradient(135deg,#f0ebe3,#e8ddd0)',
                  }}>
                    {emoji}
                  </div>
                  <div style={{ padding: '20px 22px', flex: 1 }}>
                    <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '4px' }}>
                      {biz.category_name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '6px' }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.2 }}>
                        {biz.name}
                      </div>
                      {biz.is_featured && <span className="badge badge-featured">⭐ Featured</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <span className="stars">{'★'.repeat(fullStars)}{'☆'.repeat(emptyStars)}</span>
                      <span style={{ fontWeight: 700, fontSize: '.9rem' }}>{formatRating(rating)}</span>
                      <span style={{ fontSize: '.82rem', color: 'var(--muted)' }}>({biz.review_count} reviews)</span>
                    </div>
                    {biz.description && (
                      <p style={{ fontSize: '.87rem', color: 'var(--muted)', lineHeight: 1.55, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {biz.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '.82rem', color: 'var(--muted)' }}>
                      {biz.neighborhood && <span>📍 {biz.neighborhood}{biz.city_name ? `, ${biz.city_name}` : ''}</span>}
                      {biz.price_range && <span>💰 {priceLabel(biz.price_range)}</span>}
                      {biz.is_verified && <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Verified</span>}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '16px 0 40px' }}>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => push({ page: String(p) })}
                  style={{
                    width: '38px', height: '38px', borderRadius: '8px',
                    border: '1.5px solid var(--border)',
                    background: currentPage === p ? 'var(--green)' : '#fff',
                    color: currentPage === p ? '#fff' : 'var(--charcoal)',
                    fontWeight: 600, fontSize: '.88rem', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
