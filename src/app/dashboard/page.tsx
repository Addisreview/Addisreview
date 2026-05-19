'use client';

// src/app/dashboard/page.tsx

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { createBrowserClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { User } from '@supabase/supabase-js';
import type { Business } from '@/types/database';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const PRICE_LABELS = ['', '$ Budget', '$$ Moderate', '$$$ Upscale', '$$$$ Luxury'];
const FEATURE_SUGGESTIONS = [
  'Free WiFi', 'Parking Available', 'Outdoor Seating', 'Air Conditioning',
  'Live Music', 'Delivery', 'Takeaway', 'Reservations', 'Wheelchair Accessible',
  'Family Friendly', 'Pet Friendly', 'Fasting Options', 'Halal', 'Card Payment',
];

type Tab = 'info' | 'hours' | 'photos' | 'features';

export default function OwnerDashboard() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selected, setSelected] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [uploading, setUploading] = useState(false);

  // Editable fields
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [priceRange, setPriceRange] = useState<number>(0);
  const [hours, setHours] = useState<Record<string, string>>({});
  const [features, setFeatures] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [coverPhoto, setCoverPhoto] = useState('');
  const [customFeature, setCustomFeature] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/auth?redirect=/dashboard');
        return;
      }
      setUser(data.user);

      // Fetch businesses claimed by this user
      const { data: bizData } = await (supabase
        .from('businesses')
        .select('*')
        .eq('claimed_by', data.user.id)
        .eq('is_claimed', true) as any);

      const list = bizData || [];
      setBusinesses(list);
      if (list.length > 0) selectBusiness(list[0]);
      setLoading(false);
    });
  }, []);

  const selectBusiness = (biz: Business) => {
    setSelected(biz);
    setDescription(biz.description || '');
    setPhone(biz.phone || '');
    setWebsite(biz.website || '');
    setEmail((biz as any).email || '');
    setAddress(biz.address || '');
    setNeighborhood(biz.neighborhood || '');
    setPriceRange(biz.price_range || 0);
    setHours((biz.hours as Record<string, string>) || {});
    setFeatures(biz.features || []);
    setPhotos(biz.photos || []);
    setCoverPhoto(biz.cover_photo_url || '');
  };

  const handleSave = async () => {
    if (!selected || !user) return;
    setSaving(true);
    try {
      const res = await fetch('/api/business/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selected.id,
          userId: user.id,
          updates: {
            description,
            phone,
            website,
            email,
            address,
            neighborhood,
            price_range: priceRange || null,
            hours,
            features,
            photos,
            cover_photo_url: coverPhoto,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Changes saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user) return;
    setUploading(true);

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} is too large (max 5MB)`); continue; }
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `business/${selected!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('review-photos').upload(path, file, { cacheControl: '3600' });
      if (error) { toast.error(`Failed to upload ${file.name}`); continue; }
      const { data: urlData } = supabase.storage.from('review-photos').getPublicUrl(path);
      const url = urlData.publicUrl;
      setPhotos(prev => [...prev, url]);
      if (!coverPhoto) setCoverPhoto(url);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (url: string) => {
    setPhotos(prev => prev.filter(p => p !== url));
    if (coverPhoto === url) setCoverPhoto(photos.find(p => p !== url) || '');
  };

  const toggleFeature = (f: string) => {
    setFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const addCustomFeature = () => {
    if (!customFeature.trim()) return;
    setFeatures(prev => [...prev, customFeature.trim()]);
    setCustomFeature('');
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={{ padding: '80px', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
      <Footer />
    </>
  );

  if (businesses.length === 0) return (
    <>
      <Navbar />
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 5vw', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏢</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 900, marginBottom: '12px' }}>
          No businesses yet
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '32px', lineHeight: 1.6 }}>
          You haven't claimed any businesses yet. Find your business on AddisReview and claim it to manage your listing.
        </p>
        <Link href="/search">
          <button className="btn-primary">Find Your Business →</button>
        </Link>
      </main>
      <Footer />
    </>
  );

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'info', label: 'Business Info', emoji: '📋' },
    { id: 'hours', label: 'Hours', emoji: '🕐' },
    { id: 'photos', label: 'Photos', emoji: '📷' },
    { id: 'features', label: 'Features', emoji: '✨' },
  ];

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
        <style>{`
          .dash-tab:hover { background: var(--green-pale) !important; color: var(--green) !important; }
          .feature-chip:hover { border-color: var(--green) !important; }
          .photo-card:hover .photo-actions { opacity: 1 !important; }
          @media (max-width: 768px) {
            .dash-layout { grid-template-columns: 1fr !important; }
            .dash-sidebar { display: none !important; }
          }
        `}</style>

        {/* HEADER */}
        <div style={{ background: 'linear-gradient(135deg, #0e3d26, var(--green))', padding: '32px 5vw' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Owner Dashboard
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>
                {selected?.name}
              </h1>
              <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.6)', marginTop: '4px' }}>
                {selected?.category_name} · {selected?.city_name}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link href={`/business/${selected?.slug}`} target="_blank" style={{ textDecoration: 'none' }}>
                <button style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: '50px', padding: '9px 18px', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                  View Public Page ↗
                </button>
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ background: 'var(--yellow)', color: 'var(--charcoal)', border: 'none', borderRadius: '50px', padding: '9px 22px', fontSize: '.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving…' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="dash-layout" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '28px', maxWidth: '1200px', margin: '0 auto', padding: '32px 5vw' }}>

          {/* SIDEBAR */}
          <div className="dash-sidebar">
            {/* Business switcher */}
            {businesses.length > 1 && (
              <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border)', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '10px' }}>Your Businesses</div>
                {businesses.map(biz => (
                  <button
                    key={biz.id}
                    onClick={() => selectBusiness(biz)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 12px', borderRadius: '8px', border: 'none',
                      background: selected?.id === biz.id ? 'var(--green-pale)' : 'transparent',
                      color: selected?.id === biz.id ? 'var(--green)' : 'var(--charcoal)',
                      fontFamily: 'var(--font-sans)', fontSize: '.85rem', fontWeight: 600,
                      cursor: 'pointer', marginBottom: '4px',
                    }}
                  >
                    {biz.name}
                  </button>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border)', padding: '8px' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className="dash-tab"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', textAlign: 'left', padding: '11px 14px',
                    borderRadius: '10px', border: 'none',
                    background: activeTab === tab.id ? 'var(--green)' : 'transparent',
                    color: activeTab === tab.id ? '#fff' : 'var(--charcoal)',
                    fontFamily: 'var(--font-sans)', fontSize: '.88rem', fontWeight: 600,
                    cursor: 'pointer', marginBottom: '2px', transition: 'all .15s',
                  }}
                >
                  <span>{tab.emoji}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div>
            {/* Mobile tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '8px 16px', borderRadius: '50px', border: 'none', whiteSpace: 'nowrap',
                    background: activeTab === tab.id ? 'var(--green)' : '#fff',
                    color: activeTab === tab.id ? '#fff' : 'var(--charcoal)',
                    fontFamily: 'var(--font-sans)', fontSize: '.82rem', fontWeight: 600,
                    cursor: 'pointer', border: activeTab === tab.id ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {tab.emoji} {tab.label}
                </button>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '28px' }}>

              {/* INFO TAB */}
              {activeTab === 'info' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px' }}>Business Information</h2>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '7px', display: 'block' }}>Description</label>
                    <textarea
                      className="form-textarea"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Tell customers what makes your business special…"
                      maxLength={500}
                      style={{ minHeight: '120px' }}
                    />
                    <div style={{ fontSize: '.75rem', color: 'var(--muted)', textAlign: 'right', marginTop: '4px' }}>{description.length}/500</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '7px', display: 'block' }}>Phone Number</label>
                      <input type="tel" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251911234567" />
                    </div>
                    <div>
                      <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '7px', display: 'block' }}>Email</label>
                      <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="info@yourbusiness.com" />
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '7px', display: 'block' }}>Website</label>
                    <input type="url" className="form-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourbusiness.com" />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '7px', display: 'block' }}>Address</label>
                    <input type="text" className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '7px', display: 'block' }}>Neighborhood</label>
                      <input type="text" className="form-input" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="e.g. Bole, Kazanchis" />
                    </div>
                    <div>
                      <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '7px', display: 'block' }}>Price Range</label>
                      <select className="form-input" value={priceRange} onChange={e => setPriceRange(Number(e.target.value))} style={{ cursor: 'pointer' }}>
                        <option value={0}>Not specified</option>
                        {PRICE_LABELS.slice(1).map((label, i) => (
                          <option key={i + 1} value={i + 1}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* HOURS TAB */}
              {activeTab === 'hours' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px' }}>Opening Hours</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {DAYS.map(day => (
                      <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '100px', fontWeight: 600, fontSize: '.9rem', textTransform: 'capitalize', flexShrink: 0 }}>{day}</div>
                        <input
                          type="text"
                          className="form-input"
                          value={hours[day] || ''}
                          onChange={e => setHours(prev => ({ ...prev, [day]: e.target.value }))}
                          placeholder="e.g. 8:00 AM - 10:00 PM or Closed"
                          style={{ flex: 1 }}
                        />
                        <button
                          onClick={() => setHours(prev => ({ ...prev, [day]: 'Closed' }))}
                          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '50px', padding: '6px 14px', fontSize: '.78rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--muted)', flexShrink: 0 }}
                        >
                          Closed
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--cream)', borderRadius: '10px', fontSize: '.8rem', color: 'var(--muted)' }}>
                    💡 Format: "8:00 AM - 10:00 PM" or type "Closed" for days you're not open.
                  </div>
                </div>
              )}

              {/* PHOTOS TAB */}
              {activeTab === 'photos' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Photos</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '24px' }}>Upload photos of your business. The cover photo appears at the top of your listing.</p>

                  {/* Upload button */}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={handlePhotoUpload} />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '28px', textAlign: 'center', cursor: 'pointer', marginBottom: '24px', transition: 'border-color .2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div>
                    <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '4px' }}>
                      {uploading ? 'Uploading…' : 'Click to upload photos'}
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>JPG, PNG or WEBP · Max 5MB each</div>
                  </div>

                  {/* Photo grid */}
                  {photos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                      {photos.map((url, i) => (
                        <div key={i} className="photo-card" style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '1' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {coverPhoto === url && (
                            <div style={{ position: 'absolute', top: '6px', left: '6px', background: 'var(--green)', color: '#fff', fontSize: '.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '50px' }}>
                              Cover
                            </div>
                          )}
                          <div className="photo-actions" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0, transition: 'opacity .2s' }}>
                            {coverPhoto !== url && (
                              <button
                                onClick={() => setCoverPhoto(url)}
                                style={{ background: '#fff', color: 'var(--charcoal)', border: 'none', borderRadius: '50px', padding: '6px 14px', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                              >
                                Set as Cover
                              </button>
                            )}
                            <button
                              onClick={() => removePhoto(url)}
                              style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '50px', padding: '6px 14px', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* FEATURES TAB */}
              {activeTab === 'features' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Features & Highlights</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '24px' }}>Select features that describe your business. These appear on your listing.</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                    {FEATURE_SUGGESTIONS.map(f => (
                      <button
                        key={f}
                        className="feature-chip"
                        onClick={() => toggleFeature(f)}
                        style={{
                          padding: '8px 16px', borderRadius: '50px',
                          border: features.includes(f) ? '2px solid var(--green)' : '1.5px solid var(--border)',
                          background: features.includes(f) ? 'var(--green-pale)' : '#fff',
                          color: features.includes(f) ? 'var(--green)' : 'var(--charcoal)',
                          fontFamily: 'var(--font-sans)', fontSize: '.85rem', fontWeight: 600,
                          cursor: 'pointer', transition: 'all .15s',
                        }}
                      >
                        {features.includes(f) ? '✓ ' : ''}{f}
                      </button>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                    <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '10px', display: 'block' }}>Add custom feature</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={customFeature}
                        onChange={e => setCustomFeature(e.target.value)}
                        placeholder="e.g. Rooftop View, Valet Parking…"
                        onKeyDown={e => e.key === 'Enter' && addCustomFeature()}
                        style={{ flex: 1 }}
                      />
                      <button onClick={addCustomFeature} className="btn-primary" style={{ borderRadius: '10px', padding: '0 20px', flexShrink: 0 }}>
                        Add
                      </button>
                    </div>

                    {features.filter(f => !FEATURE_SUGGESTIONS.includes(f)).length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '10px' }}>Custom Features</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {features.filter(f => !FEATURE_SUGGESTIONS.includes(f)).map(f => (
                            <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--green-pale)', color: 'var(--green)', padding: '6px 14px', borderRadius: '50px', fontSize: '.82rem', fontWeight: 600 }}>
                              {f}
                              <button onClick={() => setFeatures(prev => prev.filter(x => x !== f))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: '1rem', lineHeight: 1, padding: 0 }}>×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SAVE BUTTON */}
              <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary"
                  style={{ padding: '13px 32px', fontSize: '.95rem' }}
                >
                  {saving ? 'Saving…' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
