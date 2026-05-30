import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createBrowserClient } from '@/lib/supabase';
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
  const name = review.profiles?.display_name
    || review.author_name
    || 'Anonymous';

  const avatarUrl = review.profiles?.avatar_url;
  const initial = name.charAt(0).toUpperCase();
  const avatarColor = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  const fullStars = review.rating;
  const emptyStars = 5 - fullStars;

  const supabase = createBrowserClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({
    fire: 0, helpful: 0, love_this: 0, disappointing: 0,
  });

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setCurrentUserId(uid);

      const { data: reactions } = await (supabase as any)
        .from('review_reactions')
        .select('user_id, reaction')
        .eq('review_id', review.id);

      if (reactions) {
        const counts: Record<string, number> = { fire: 0, helpful: 0, love_this: 0, disappointing: 0 };
        const mine: string[] = [];
        for (const r of reactions) {
          if (r.reaction in counts) counts[r.reaction]++;
          if (uid && r.user_id === uid) mine.push(r.reaction);
        }
        setReactionCounts(counts);
        setUserReactions(mine);
      }
    }
    load();
  }, [review.id]);

  const handleReaction = async (reaction: string) => {
    if (!currentUserId) {
      toast.error('Please log in to react');
      return;
    }
    const res = await fetch('/api/review-reaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId: review.id, userId: currentUserId, reaction }),
    });
    const data = await res.json();
    if (data.success) {
      if (data.action === 'added') {
        setUserReactions(prev => [...prev, reaction]);
        setReactionCounts(prev => ({ ...prev, [reaction]: (prev[reaction] || 0) + 1 }));
      } else {
        setUserReactions(prev => prev.filter(r => r !== reaction));
        setReactionCounts(prev => ({ ...prev, [reaction]: Math.max((prev[reaction] || 1) - 1, 0) }));
      }
    }
  };

  const REACTIONS = [
    { key: 'fire',         emoji: '🔥', label: 'Fire' },
    { key: 'helpful',      emoji: '👍', label: 'Helpful' },
    { key: 'love_this',    emoji: '❤️', label: 'Love This' },
    { key: 'disappointing',emoji: '😬', label: 'Disappointing' },
  ];

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

      {/* Photos */}
      {(review as any).photo_urls && (review as any).photo_urls.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          {(review as any).photo_urls.map((url: string, i: number) => (
            <img
              key={i}
              src={url}
              alt=""
              onClick={() => window.open(url, '_blank')}
              style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
            />
          ))}
        </div>
      )}

      {/* Reactions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
        {REACTIONS.map(({ key, emoji, label }) => {
          const active = userReactions.includes(key);
          const count = reactionCounts[key] || 0;
          return (
            <button
              key={key}
              onClick={() => handleReaction(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: active ? 'var(--green)' : '#fff',
                color: active ? '#fff' : 'var(--charcoal)',
                border: `1px solid ${active ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: '50px', padding: '5px 14px',
                fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-sans)', transition: 'all .2s',
              }}
            >
              {emoji} {label}{count > 0 ? ` · ${count}` : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
