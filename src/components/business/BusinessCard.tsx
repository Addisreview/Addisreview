import Link from 'next/link';
import type { Business } from '@/types/database';
import { formatRating, priceLabel, getCategoryEmoji } from '@/lib/utils';

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
  business: Business;
}

export default function BusinessCard({ business }: Props) {
  const emoji = getCategoryEmoji(business.category_name || '');
  const bg = CARD_COLORS[business.category_name || ''] || 'linear-gradient(135deg,#333,#555)';
  const rating = Number(business.rating_avg) || 0;
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;

  return (
    <Link
      href={`/business/${business.slug || business.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className="card-hover" style={{
        background: '#fff',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        height: '100%',
      }}>
        {/* Thumbnail */}
        <div style={{
          height: '180px',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4.5rem',
          position: 'relative',
        }}>
          {emoji}
          <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span className={`badge ${business.is_featured ? 'badge-featured' : ''}`} style={{ visibility: business.is_featured ? 'visible' : 'hidden' }}>
              ⭐ Featured
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 18px 20px' }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.9px', marginBottom: '5px' }}>
            {business.category_name}
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.18rem', fontWeight: 700, marginBottom: '8px', lineHeight: 1.2 }}>
            {business.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span className="stars" style={{ fontSize: '1rem' }}>
              {'★'.repeat(fullStars)}{'☆'.repeat(emptyStars)}
            </span>
            <span style={{ fontWeight: 700, fontSize: '.88rem' }}>{formatRating(rating)}</span>
            <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>({business.review_count} reviews)</span>
          </div>
          <div style={{ fontSize: '.81rem', color: 'var(--muted)', display: 'flex', gap: '14px' }}>
            {business.neighborhood && <span>📍 {business.neighborhood}</span>}
            {business.price_range && <span>💰 {priceLabel(business.price_range)}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
