'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { BusinessWithCount, Category, City } from '@/types/database';
import { priceLabel, getCategoryEmoji } from '@/lib/utils';

const NEIGHBORHOODS = [
  'Bole', 'Piassa', 'Kazanchis', 'Megenagna', 'CMC', 'Sarbet',
  'Merkato', 'Lideta', 'Semen Mazoria', 'Gerji', 'Ayat',
  'Gofa', 'Jemo', 'Kotebe', 'Kolfe', 'Akaki'
];

const CARD_COLORS: Record<string, string> = {
  'Restaurants':   'linear-gradient(135deg,#6b2e0a,#c45e1e)',
  'Coffee & Buna': 'linear-gradient(135deg,#1a3d1a,#2e6b2e)',
  'Hotels':        'linear-gradient(135deg,#0e2a5c,#1e4f9e)',
  'Spas':          'linear-gradient(135deg,#3d1a6b,#7a3db5)',
  'Shopping':      'linear-gradient(135deg,#5c1a0e,#a83418)',
  'Entertainment': 'linear-gradient(135deg,#0a4a3a,#1a8a6a)',
  'Healthcare':    'linear-gradient(135deg,#1a3d5c,#2e6b9e)',
  'Services':      'linear-gradient(135deg,#3a3a1a,#6b6b2e)',
};

interface Props {
  businesses: BusinessWithCount[];
  totalCount: number;
  categories: Category[];
  cities: Pick<City, 'id' | 'name' | 'emoji'>[];
  currentFilters: { q?: string; city?: string; category?: string; rating?: string; sort?: string; neighborhood?: string; open_now?: string };
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
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(currentFilters.neighborhood || '');
  const [openNow, setOpenNow] = useState(currentFilters.open_now === 'true');
  const [showAllCats, setShowAllCats] = useState(false);
  const [showAllNeighborhoods, setShowAllNeighborhoods] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const push = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { q, city, category: selectedCat, rating: selectedRating, sort, neighborhood: selectedNeighborhood, open_now: openNow ? 'true' : '', ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== '0') params.set(k, v); });
    router.push(`/search?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalCount / 10);
  const visibleCats = showAllCats ? categories : categories.slice(0, 8);
  const visibleNeighborhoods = showAllNeighborhoods ? NEIGHBORHOODS : NEIGHBORHOODS.slice(0, 6);
  const filterLabel = { fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.8px', color: 'var(--muted)', marginBottom: '12px' };

  const FiltersPanel = () => (
    <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '24px' }}>
      <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>Filters</div>

      {/* OPEN NOW */}
      <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '.92rem', fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={openNow}
            onChange={e => { setOpenNow(e.target.checked); push({ open_now: e.target.checked ? 'true' : '' }); }}
            style={{ accentColor: 'var(--green)', width: '18px', height: '18px' }}
          />
          🟢 Open Now
        </label>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={filterLabel}>Category</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px', cursor: 'pointer', fontSize: '.88rem' }}>
          <input type="radio" name="cat" checked={selectedCat === ''} onChange={() => { setSelectedCat(''); push({ category: '' }); }} style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
          All Categories
        </label>
        {visibleCats.map(cat => (
          <label key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px', cursor: 'pointer', fontSize: '.88rem' }}>
            <input type="radio" name="cat" checked={selectedCat === cat.name} onChange={() => { setSelectedCat(cat.name); push({ category: cat.name }); setShowFilters(false); }} style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
            {cat.emoji || '📍'} {cat.name}
          </label>
        ))}
        {categories.length > 8 && (
          <button onClick={() => setShowAllCats(!showAllCats)} style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: '.82rem', cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            {showAllCats ? 'Show less ↑' : `Show all ${categories.length} categories ↓`}
          </button>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={filterLabel}>Neighborhood</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px', cursor: 'pointer', fontSize: '.88rem' }}>
          <input type="radio" name="neighborhood" checked={selectedNeighborhood === ''} onChange={() => { setSelectedNeighborhood(''); push({ neighborhood: '' }); }} style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
          All Neighborhoods
        </label>
        {visibleNeighborhoods.map(n => (
          <label key={n} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px', cursor: 'pointer', fontSize: '.88rem' }}>
            <input type="radio" name="neighborhood" checked={selectedNeighborhood === n} onChange={() => { setSelectedNeighborhood(n); push({ neighborhood: n }); setShowFilters(false); }} style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
            {n}
          </label>
        ))}
        <button onClick={() => setShowAllNeighborhoods(!showAllNeighborhoods)} style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: '.82rem', cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
          {showAllNeighborhoods ? 'Show less ↑' : 'Show all neighborhoods ↓'}
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={filterLabel}>Minimum Rating</div>
        {[['0','Any rating'],['4','★★★★☆ 4+ stars'],['3','★★★☆☆ 3+ stars']].map(([val, label]) => (
          <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px', cursor: 'pointer', fontSize: '.88rem' }}>
            <input type="radio" name="rating" checked={selectedRating === val} onChange={() => { setSelectedRating(val); push({ rating: val }); }} style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
            {label}
          </label>
        ))}
      </div>
      <div style={{ marginBottom: '24px' }}>
        <div style={filterLabel}>Sort By</div>
        {[['rating','Highest Rated'],['reviews','Most Reviewed'],['name','A to Z']].map(([val, label]) => (
          <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px', cursor: 'pointer', fontSize: '.88rem' }}>
            <input type="radio" name="sort" checked={sort === val} onChange={() => { setSort(val); push({ sort: val }); }} style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
            {label}
          </label>
        ))}
      </div>

      <button className="btn-primary" style={{ width: '100%', borderRadius: '10px' }} onClick={() => { push({}); setShowFilters(false); }}>Apply Filters</button>
      <button onClick={() => {
        setSelectedCat(''); setSelectedRating('0'); setSelectedPrices([]);
        setQ(''); setCity(''); setSelectedNeighborhood(''); setSort('rating'); setOpenNow(false);
        push({ q:'', city:'', category:'', rating:'0', neighborhood:'', sort:'rating', open_now:'' });
        setShowFilters(false);
      }} style={{ width: '100%', marginTop: '8px', padding: '10px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.85rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
        Clear all filters
      </button>
    </div>
  );

  return (
    <main>
      <style>{`
        @media (max-width: 768px) {
          .search-layout { grid-template-columns: 1fr !important; padding: 16px !important; }
          .filters-desktop { display: none !important; }
          .mobile-filter-btn { display: flex !important; }
          .biz-card { flex-direction: column !important; }
          .biz-card-img { width: 100% !important; min-width: unset !important; height: 200px !important; }
          .search-bar-inner { flex-direction: column; }
          .search-bar-city { border-left: none !important; border-top: 1px solid var(--border) !important; }
        }
      `}</style>

      <div style={{ background: 'var(--green)', padding: '24px 5vw' }}>
        <div style={{ display: 'flex', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', maxWidth: '700px' }} className="search-bar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', flex: 1, borderRight: '1px solid var(--border)' }}>
            <input type="text" placeholder="Restaurants, hotels, spas…" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && push({})} style={{ border: 'none', outline: 'none', fontSize: '.93rem', width: '100%', padding: '14px 0', background: 'transparent' }} />
          </div>
          <div className="search-bar-city" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', flex: 1 }}>
            <input type="text" placeholder="City or area…" value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && push({})} style={{ border: 'none', outline: 'none', fontSize: '.93rem', width: '100%', padding: '14px 0', background: 'transparent' }} />
          </div>
          <button onClick={() => push({})} style={{ background: 'var(--yellow)', border: 'none', padding: '0 24px', fontFamily: 'var(--font-sans)', fontSize: '.95rem', fontWeight: 700, color: 'var(--charcoal)', cursor: 'pointer' }}>Search</button>
        </div>
      </div>

      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <button className="mobile-filter-btn" onClick={() => setShowFilters(true)} style={{ display: 'none', alignItems: 'center', gap: '8px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '50px', padding: '10px 20px', fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
          ☰ Filters {(selectedCat || selectedRating !== '0' || openNow) ? '•' : ''}
        </button>
      </div>

      {showFilters && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowFilters(false); }} style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.5)', overflowY: 'auto', padding: '80px 16px 16px' }}>
          <div style={{ maxWidth: '420px', margin: '0 auto' }}>
            <FiltersPanel />
          </div>
        </div>
      )}

      <div className="search-layout" style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '32px', padding: '40px 5vw', maxWidth: '1300px' }}>
        <div className="filters-desktop" style={{ position: 'sticky', top: '84px', height: 'fit-content' }}>
          <FiltersPanel />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '1rem', color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--charcoal)' }}>{totalCount.toLocaleString()} result{totalCount !== 1 ? 's' : ''}</strong>
              {currentFilters.q && ` for "${currentFilters.q}"`}
              {currentFilters.category && ` in ${currentFilters.category}`}
              {currentFilters.neighborhood && ` · ${currentFilters.neighborhood}`}
              {currentFilters.open_now === 'true' && ` · Open Now`}
            </div>
          </div>

          {businesses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '8px' }}>No results found</div>
              <div style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '24px' }}>Try different keywords or filters</div>
              <button className="btn-primary" onClick={() => push({ q:'', city:'', category:'', rating:'0', neighborhood:'', open_now:'' })}>Clear Search</button>
            </div>
          ) : businesses.map(biz => {
            const emoji = getCategoryEmoji(biz.category_name || '');
            const photo = (biz as any).cover_photo_url || null;
            const bg = CARD_COLORS[biz.category_name || ''] || 'linear-gradient(135deg,#f0ebe3,#e8ddd0)';
            const addisRating = Number((biz as any).rating_avg) || 0;
            const googleRating = Number(biz.google_rating) || 0;

            return (
              <Link key={biz.id} href={`/business/${biz.slug || biz.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card-hover biz-card" style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', overflow: 'hidden', cursor: 'pointer', marginBottom: '18px' }}>
                  <div className="biz-card-img" style={{ width: '160px', minWidth: '160px', position: 'relative', overflow: 'hidden', background: photo ? 'transparent' : bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                    {photo ? (
                      <img src={photo} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { const t = e.currentTarget; t.style.display = 'none'; const p = t.parentElement; if (p) { p.style.background = bg; p.innerHTML = `<span style="font-size:4rem">${emoji}</span>`; } }} />
                    ) : <span>{emoji}</span>}
                  </div>
                  <div style={{ padding: '16px 18px', flex: 1 }}>
                    <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '4px' }}>{biz.category_name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '6px' }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2 }}>{biz.name}</div>
                      {biz.is_featured && <span className="badge badge-featured">⭐ Featured</span>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '8px' }}>
                      {addisRating > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span className="stars" style={{ fontSize: '.85rem' }}>{'★'.repeat(Math.floor(addisRating))}{'☆'.repeat(5 - Math.floor(addisRating))}</span>
                          <span style={{ fontWeight: 700, fontSize: '.85rem' }}>{addisRating.toFixed(1)}</span>
                          <span style={{ fontSize: '.75rem', color: 'var(--green)', fontWeight: 600 }}>AddisReview</span>
                          <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>({biz.review_count})</span>
                        </div>
                      )}
                      {googleRating > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span className="stars" style={{ fontSize: '.85rem' }}>{'★'.repeat(Math.floor(googleRating))}{'☆'.repeat(5 - Math.floor(googleRating))}</span>
                          <span style={{ fontWeight: 700, fontSize: '.85rem' }}>{googleRating.toFixed(1)}</span>
                          <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Google</span>
                        </div>
                      )}
                    </div>
                    {biz.description && (
                      <p style={{ fontSize: '.87rem', color: 'var(--muted)', lineHeight: 1.55, marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{biz.description}</p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '.82rem', color: 'var(--muted)', flexWrap: 'wrap' }}>
                      {biz.neighborhood && <span>📍 {biz.neighborhood}{biz.city_name ? `, ${biz.city_name}` : ''}</span>}
                      {biz.price_range && <span>💰 {priceLabel(biz.price_range)}</span>}
                      {biz.is_verified && (
  <span 
    title="This business has been verified by AddisReview as a legitimate, active business in Addis Ababa."
    style={{ color: 'var(--green)', fontWeight: 600, cursor: 'help', borderBottom: '1px dotted var(--green)' }}
  >
    ✓ Verified
  </span>
)}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '16px 0 40px', flexWrap: 'wrap' }}>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => push({ page: String(p) })} style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1.5px solid var(--border)', background: currentPage === p ? 'var(--green)' : '#fff', color: currentPage === p ? '#fff' : 'var(--charcoal)', fontWeight: 600, fontSize: '.88rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
