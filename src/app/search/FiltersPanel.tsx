'use client';

import type { Category } from '@/types/database';

const NEIGHBORHOODS = [
  'Bole', 'Piassa', 'Kazanchis', 'Megenagna', 'CMC', 'Sarbet',
  'Merkato', 'Lideta', 'Semen Mazoria', 'Gerji', 'Ayat',
  'Gofa', 'Jemo', 'Kotebe', 'Kolfe', 'Akaki'
];

interface FiltersPanelProps {
  categories: Category[];
  selectedCat: string;
  setSelectedCat: (v: string) => void;
  catSearch: string;
  setCatSearch: (v: string) => void;
  selectedRating: string;
  setSelectedRating: (v: string) => void;
  selectedNeighborhood: string;
  setSelectedNeighborhood: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  openNow: boolean;
  setOpenNow: (v: boolean) => void;
  showAllNeighborhoods: boolean;
  setShowAllNeighborhoods: (v: boolean) => void;
  onApply: (overrides: Record<string, string>) => void;
  onClear: () => void;
  setShowFilters: (v: boolean) => void;
}

export default function FiltersPanel({
  categories, selectedCat, setSelectedCat, catSearch, setCatSearch,
  selectedRating, setSelectedRating, selectedNeighborhood, setSelectedNeighborhood,
  sort, setSort, openNow, setOpenNow, showAllNeighborhoods, setShowAllNeighborhoods,
  onApply, onClear, setShowFilters,
}: FiltersPanelProps) {
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));
  const filteredCats = catSearch.trim()
    ? sortedCategories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))
    : sortedCategories;
  const visibleNeighborhoods = showAllNeighborhoods ? NEIGHBORHOODS : NEIGHBORHOODS.slice(0, 6);
  const filterLabel = { fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.8px', color: 'var(--muted)', marginBottom: '12px' };

  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '24px' }}>
      <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>Filters</div>

      {/* OPEN NOW */}
      <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '.92rem', fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={openNow}
            onChange={e => { setOpenNow(e.target.checked); onApply({ open_now: e.target.checked ? 'true' : '' }); }}
            style={{ accentColor: 'var(--green)', width: '18px', height: '18px' }}
          />
          🟢 Open Now
        </label>
      </div>

      {/* CATEGORY WITH SEARCH */}
      <div style={{ marginBottom: '24px' }}>
        <div style={filterLabel}>Category</div>
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Search categories…"
            value={catSearch}
            onChange={e => setCatSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 30px 8px 10px',
              border: '1.5px solid var(--border)', borderRadius: '8px',
              fontSize: '.84rem', fontFamily: 'var(--font-sans)',
              outline: 'none', boxSizing: 'border-box', background: '#fafafa',
            }}
          />
          {catSearch && (
            <button
              onClick={() => setCatSearch('')}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '.85rem', padding: '0' }}
            >✕</button>
          )}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', cursor: 'pointer', fontSize: '.88rem' }}>
          <input type="radio" name="cat" checked={selectedCat === ''} onChange={() => { setSelectedCat(''); setCatSearch(''); onApply({ category: '' }); }} style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
          All Categories
        </label>

        <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
          {filteredCats.length === 0 ? (
            <div style={{ fontSize: '.84rem', color: 'var(--muted)', padding: '8px 0' }}>No categories found</div>
          ) : filteredCats.map(cat => (
            <label key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', cursor: 'pointer', fontSize: '.88rem' }}>
              <input
                type="radio"
                name="cat"
                checked={selectedCat === cat.name}
                onChange={() => { setSelectedCat(cat.name); setCatSearch(''); onApply({ category: cat.name }); setShowFilters(false); }}
                style={{ accentColor: 'var(--green)', width: '16px', height: '16px', flexShrink: 0 }}
              />
              {cat.emoji || '📍'} {cat.name}
            </label>
          ))}
        </div>
        {selectedCat && (
          <button
            onClick={() => { setSelectedCat(''); setCatSearch(''); onApply({ category: '' }); }}
            style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: '.82rem', cursor: 'pointer', padding: '6px 0 0', fontFamily: 'var(--font-sans)', fontWeight: 600 }}
          >
            ✕ Clear category
          </button>
        )}
      </div>

      {/* NEIGHBORHOOD */}
      <div style={{ marginBottom: '24px' }}>
        <div style={filterLabel}>Neighborhood</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px', cursor: 'pointer', fontSize: '.88rem' }}>
          <input type="radio" name="neighborhood" checked={selectedNeighborhood === ''} onChange={() => { setSelectedNeighborhood(''); onApply({ neighborhood: '' }); }} style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
          All Neighborhoods
        </label>
        {visibleNeighborhoods.map(n => (
          <label key={n} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px', cursor: 'pointer', fontSize: '.88rem' }}>
            <input type="radio" name="neighborhood" checked={selectedNeighborhood === n} onChange={() => { setSelectedNeighborhood(n); onApply({ neighborhood: n }); setShowFilters(false); }} style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
            {n}
          </label>
        ))}
        <button onClick={() => setShowAllNeighborhoods(!showAllNeighborhoods)} style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: '.82rem', cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
          {showAllNeighborhoods ? 'Show less ↑' : 'Show all neighborhoods ↓'}
        </button>
      </div>

      {/* RATING */}
      <div style={{ marginBottom: '24px' }}>
        <div style={filterLabel}>Minimum Rating</div>
        {[['0','Any rating'],['4','★★★★☆ 4+ stars'],['3','★★★☆☆ 3+ stars']].map(([val, label]) => (
          <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px', cursor: 'pointer', fontSize: '.88rem' }}>
            <input type="radio" name="rating" checked={selectedRating === val} onChange={() => { setSelectedRating(val); onApply({ rating: val }); }} style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
            {label}
          </label>
        ))}
      </div>

      {/* SORT */}
      <div style={{ marginBottom: '24px' }}>
        <div style={filterLabel}>Sort By</div>
        {[['rating','Highest Rated'],['reviews','Most Reviewed'],['name','A to Z']].map(([val, label]) => (
          <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px', cursor: 'pointer', fontSize: '.88rem' }}>
            <input type="radio" name="sort" checked={sort === val} onChange={() => { setSort(val); onApply({ sort: val }); }} style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
            {label}
          </label>
        ))}
      </div>

      <button className="btn-primary" style={{ width: '100%', borderRadius: '10px' }} onClick={() => { onApply({}); setShowFilters(false); }}>Apply Filters</button>
      <button onClick={onClear} style={{ width: '100%', marginTop: '8px', padding: '10px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.85rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
        Clear all filters
      </button>
    </div>
  );
}
