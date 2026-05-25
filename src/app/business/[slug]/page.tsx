import { timeAgo } from '@/lib/utils';
import type { Review } from '@/types/database';

interface Props {
  review: Review & { 
    profiles?: { 
      display_name: string | null; 
      full_name?: string | null; 
      avatar_url: string | null 
    } | null 
  };
}

const AVATAR_COLORS = ['#1a5c3a','#8B4513','#6b3fa0','#1a3d5c','#5c1a0e','#0a4a3a'];

export default function ReviewCard({ review }: Props) {
  const name = review.profiles?.full_name 
    || review.profiles?.display_name 
    || review.author_name 
    || 'Anonymous';

  const avatarUrl = review.profiles?.avatar_url;

  const initial = name.charAt(0).toUpperCase();
  const avatarColor = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  const fullStars = review.rating;
  const emptyStars = 5 - fullStars;

  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
      {/* Reviewer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={name}
            style={{ 
              width: '44px', height: '44px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              flexShrink: 0 
            }} 
          />
        ) : (
          <div style={{
            width: '44px', height: '44px',
            borderRadius: '50%',
            background: avatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {initial}
          </div>
        )}

        <div>
          <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{name}</div>
          <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: '2px' }}>
            {timeAgo(review.created_at)}
          </div>
        </div>
      </div>

      {/* Stars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span className="stars">{'★'.repeat(fullStars)}{'☆'.repeat(emptyStars)}</span>
        <span style={{ fontWeight: 700, fontSize: '.88rem' }}>{review.rating}.0</span>
      </div>

      {/* Body */}
      <p style={{ fontSize: '.9rem', lineHeight: 1.6, color: '#333' }}>{review.body}</p>

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          {review.tags.map(tag => (
            <span key={tag} className="badge badge-green" style={{ fontSize: '.72rem' }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Helpful */}
      <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        Helpful?
        <button style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: '50px',
          padding: '4px 14px', fontSize: '.78rem', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', transition: 'all .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
        >
          👍 Yes ({review.helpful_count})
        </button>
        <button style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: '50px',
          padding: '4px 14px', fontSize: '.78rem', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', transition: 'all .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
        >
          👎 No
        </button>
      </div>
    </div>
  );
}
