'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { createBrowserClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StarPicker from '@/components/reviews/StarPicker';
import type { User } from '@supabase/supabase-js';

const TAGS = [
  '🍛 Amazing food','😊 Friendly staff','💰 Great value',
  '🎵 Great atmosphere','🚗 Easy parking','✨ Very clean',
  '⚡ Fast service','📍 Great location','🍃 Fasting options',
];

function WriteReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  const businessId = searchParams.get('business');
  const businessName = searchParams.get('name') || 'Unknown Business';

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user?.user_metadata?.full_name) {
        setAuthorName(data.user.user_metadata.full_name);
      }
      setLoading(false);

      // Redirect to login if not authenticated
      if (!data.user) {
        const returnUrl = `/write-review?business=${businessId}&name=${encodeURIComponent(businessName)}`;
        router.push(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
      }
    });
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    if (!rating) { toast.error('Please select a star rating'); return; }
    if (body.length < 20) { toast.error('Review must be at least 20 characters'); return; }
    if (!authorName.trim()) { toast.error('Please enter your name'); return; }
    if (!businessId) { toast.error('No business selected'); return; }

    setSubmitting(true);
    try {
      const { error } = await (supabase.from('reviews') as any).insert({
        business_id: businessId,
        user_id: user?.id || null,
        author_name: authorName.trim(),
        rating,
        body: body.trim(),
        tags: selectedTags,
        photo_urls: [],
        is_approved: true,
      });

      if (error) throw error;

      toast.success('Review submitted! Thank you 🙏');
      setTimeout(() => router.push(`/business/${businessId}`), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit review';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '80px', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>;
  }

  if (!user) {
    return <div style={{ padding: '80px', textAlign: 'center', color: 'var(--muted)' }}>Redirecting to login…</div>;
  }

  return (
    <main>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 5vw' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 900, marginBottom: '6px' }}>Write a Review</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '40px', fontSize: '.95rem' }}>Share your experience with the community.</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--cream)', borderRadius: '14px', padding: '18px 20px', marginBottom: '36px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '2.2rem' }}>🍛</div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700 }}>{businessName}</div>
            {businessId && <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '2px' }}>📍 Addis Ababa</div>}
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '10px', display: 'block' }}>
            Overall Rating <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0 28px' }} />

        <div style={{ marginBottom: '28px' }}>
          <label style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '10px', display: 'block' }}>
            Your Review <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <textarea
            className="form-textarea"
            placeholder="What did you love? What could be improved?"
            value={body}
            onChange={e => setBody(e.target.value)}
            maxLength={1000}
          />
          <div style={{ fontSize: '.78rem', color: 'var(--muted)', textAlign: 'right', marginTop: '6px' }}>
            {body.length} / 1000 characters
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '10px', display: 'block' }}>
            What did you enjoy?
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
            {TAGS.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)} style={{
                background: selectedTags.includes(tag) ? 'var(--green)' : '#fff',
                border: selectedTags.includes(tag) ? '1.5px solid var(--green)' : '1.5px solid var(--border)',
                borderRadius: '50px', padding: '8px 16px', fontSize: '.85rem',
                cursor: 'pointer', transition: 'all .2s',
                color: selectedTags.includes(tag) ? '#fff' : 'var(--charcoal)',
                fontFamily: 'var(--font-sans)',
              }}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '10px', display: 'block' }}>
            Add Photos <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '.82rem' }}>(optional)</span>
          </label>
          <div onClick={() => toast('Photo upload coming soon!')} style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📷</div>
            <p style={{ fontSize: '.88rem', color: 'var(--muted)' }}>Click to add photos</p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0 28px' }} />

        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '7px', display: 'block' }}>
            Your Name <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input type="text" className="form-input" placeholder="How you'll appear on AddisReview" value={authorName} onChange={e => setAuthorName(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => router.back()} style={{ background: '#fff', border: '1.5px solid var(--border)', color: 'var(--muted)', padding: '13px 28px', borderRadius: '50px', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '.93rem', cursor: 'pointer' }}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Review →'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function WriteReviewPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center' }}>Loading…</div>}>
        <WriteReviewForm />
      </Suspense>
      <Footer />
    </>
  );
}
