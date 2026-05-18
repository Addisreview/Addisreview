'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
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

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

function WriteReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const businessId = searchParams.get('business');
  const businessSlug = searchParams.get('slug') || businessId;
  const businessName = searchParams.get('name') || 'Unknown Business';

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user?.user_metadata?.full_name) {
        setAuthorName(data.user.user_metadata.full_name);
      }

      if (!data.user) {
        const returnUrl = `/write-review?business=${businessId}&slug=${businessSlug}&name=${encodeURIComponent(businessName)}`;
        router.push(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
        return;
      }

      if (businessId && data.user) {
        const { data: existing } = await (supabase.from('reviews') as any)
          .select('id, rating, body, tags, author_name, photo_urls')
          .eq('business_id', businessId)
          .eq('user_id', data.user.id)
          .single();

        if (existing) {
          setExistingReviewId(existing.id);
          setRating(existing.rating);
          setBody(existing.body);
          setSelectedTags(existing.tags || []);
          setAuthorName(existing.author_name);
          setExistingPhotoUrls(existing.photo_urls || []);
        }
      }

      setLoading(false);
    });
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPhotos = photos.length + existingPhotoUrls.length;

    for (const file of files) {
      if (totalPhotos + photos.length >= MAX_PHOTOS) {
        toast.error(`Maximum ${MAX_PHOTOS} photos allowed`);
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Max 5MB per photo.`);
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported image type.`);
        continue;
      }
      setPhotos(prev => [...prev, file]);
      const url = URL.createObjectURL(file);
      setPhotoPreviews(prev => [...prev, url]);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeNewPhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photos.length === 0) return existingPhotoUrls;
    setUploading(true);
    const uploadedUrls: string[] = [...existingPhotoUrls];

    for (const file of photos) {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from('review-photos')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (error) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('review-photos')
        .getPublicUrl(path);

      uploadedUrls.push(urlData.publicUrl);
    }

    setUploading(false);
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!rating) { toast.error('Please select a star rating'); return; }
    if (body.length < 20) { toast.error('Review must be at least 20 characters'); return; }
    if (!authorName.trim()) { toast.error('Please enter your name'); return; }
    if (!businessId) { toast.error('No business selected'); return; }

    setSubmitting(true);
    try {
      const photoUrls = await uploadPhotos();

      if (existingReviewId) {
        const { error } = await (supabase.from('reviews') as any)
          .update({ author_name: authorName.trim(), rating, body: body.trim(), tags: selectedTags, photo_urls: photoUrls })
          .eq('id', existingReviewId);
        if (error) throw error;
        toast.success('Review updated! Thank you 🙏');
      } else {
        const { error } = await (supabase.from('reviews') as any).insert({
          business_id: businessId,
          user_id: user?.id || null,
          author_name: authorName.trim(),
          rating,
          body: body.trim(),
          tags: selectedTags,
          photo_urls: photoUrls,
          is_approved: true,
        });
        if (error) throw error;
        toast.success('Review submitted! Thank you 🙏');
      }

      setTimeout(() => {
        router.push(`/business/${businessSlug}?t=${Date.now()}`);
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit review';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '80px', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>;
  if (!user) return <div style={{ padding: '80px', textAlign: 'center', color: 'var(--muted)' }}>Redirecting to login…</div>;

  const totalPhotos = existingPhotoUrls.length + photos.length;

  return (
    <main>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 5vw' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 900, marginBottom: '6px' }}>
          {existingReviewId ? 'Edit Your Review' : 'Write a Review'}
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '40px', fontSize: '.95rem' }}>
          {existingReviewId ? 'Update your experience with the community.' : 'Share your experience with the community.'}
        </p>

        {existingReviewId && (
          <div style={{ background: '#fff9e6', border: '1px solid var(--yellow)', borderRadius: '12px', padding: '14px 18px', marginBottom: '28px', fontSize: '.88rem' }}>
            ✏️ You already reviewed this business. You can update your review below.
          </div>
        )}

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
          <textarea className="form-textarea" placeholder="What did you love? What could be improved?" value={body} onChange={e => setBody(e.target.value)} maxLength={1000} />
          <div style={{ fontSize: '.78rem', color: 'var(--muted)', textAlign: 'right', marginTop: '6px' }}>{body.length} / 1000 characters</div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '10px', display: 'block' }}>What did you enjoy?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
            {TAGS.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)} style={{
                background: selectedTags.includes(tag) ? 'var(--green)' : '#fff',
                border: selectedTags.includes(tag) ? '1.5px solid var(--green)' : '1.5px solid var(--border)',
                borderRadius: '50px', padding: '8px 16px', fontSize: '.85rem',
                cursor: 'pointer', transition: 'all .2s',
                color: selectedTags.includes(tag) ? '#fff' : 'var(--charcoal)',
                fontFamily: 'var(--font-sans)',
              }}>{tag}</button>
            ))}
          </div>
        </div>

        {/* PHOTO UPLOAD */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '10px', display: 'block' }}>
            Add Photos <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '.82rem' }}>(optional, max {MAX_PHOTOS})</span>
          </label>

          {/* Photo previews */}
          {(existingPhotoUrls.length > 0 || photoPreviews.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginBottom: '12px' }}>
              {existingPhotoUrls.map((url, i) => (
                <div key={`existing-${i}`} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeExistingPhoto(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
              {photoPreviews.map((url, i) => (
                <div key={`new-${i}`} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeNewPhoto(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {totalPhotos < MAX_PHOTOS && (
            <>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple style={{ display: 'none' }} onChange={handlePhotoSelect} />
              <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color .2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div>
                <p style={{ fontSize: '.88rem', color: 'var(--muted)' }}>Click to add photos ({totalPhotos}/{MAX_PHOTOS})</p>
                <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '4px' }}>JPG, PNG, WEBP or HEIC · Max 5MB each</p>
              </div>
            </>
          )}
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
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting || uploading}>
            {uploading ? 'Uploading photos…' : submitting ? 'Submitting…' : existingReviewId ? 'Update Review →' : 'Submit Review →'}
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
