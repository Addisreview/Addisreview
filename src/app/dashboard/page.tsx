'use client';

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

function SkeletonPulse({ width = '100%', height = '16px', borderRadius = '8px', style = {} }: {
  width?: string; height?: string; borderRadius?: string; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, #f0ebe3 25%, #e8ddd0 50%, #f0ebe3 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style,
    }} />
  );
}

function DashboardSkeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <Navbar />
      <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
        <div style={{ background: 'linear-gradient(135deg, #0e3d26, var(--green))', padding: '32px 5vw' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <SkeletonPulse width="120px" height="12px" style={{ marginBottom: '10px', background: 'rgba(255,255,255,.15)' }} />
            <SkeletonPulse width="260px" height="28px" style={{ marginBottom: '8px', background: 'rgba(255,255,255,.2)' }} />
            <SkeletonPulse width="160px" height="14px" style={{ background: 'rgba(255,255,255,.12)' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '28px', maxWidth: '1200px', margin: '0 auto', padding: '32px 5vw' }}>
          <div>
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border)', padding: '16px', marginBottom: '16px' }}>
              {[1, 2, 3, 4].map(i => (
                <SkeletonPulse key={i} height="40px" borderRadius="8px" style={{ marginBottom: '8px' }} />
              ))}
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '28px' }}>
            <SkeletonPulse width="200px" height="22px" style={{ marginBottom: '24px' }} />
            {[1, 2, 3].map(i => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <SkeletonPulse width="100px" height="12px" style={{ marginBottom: '8px' }} />
                <SkeletonPulse height="44px" borderRadius="10px" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function OwnerDashboard() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selected, setSelected] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [uploading, setUploading] = useState(false);
  const [showUnclaimConfirm, setShowUnclaimConfirm] = useState(false);
  const [unclaiming, setUnclaiming] = useState(false);

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
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;

      if (!user) {
        router.push('/auth?redirect=/dashboard');
        return;
      }

      const [, { data: bizData }] = await Promise.all([
        Promise.resolve(setUser(user)),
        (supabase
          .from('businesses')
          .select('*')
          .eq('claimed_by', user.id)
          .eq('is_claimed', true) as any),
      ]);

      const list: Business[] = bizData || [];
      setBusinesses(list);
      if (list.length > 0) populateFields(list[0]);
      setLoading(false);
    }

    load();
  }, []);

  const populateFields = (biz: Business) => {
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
    setEditing(false);
    setShowUnclaimConfirm(false);
  };

  const selectBusiness = (biz: Business) => populateFields(biz);

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
          updates: { description, phone, website, email, address, neighborhood, price_range: priceRange || null, hours, features, photos, cover_photo_url: coverPhoto },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Changes saved!');
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (selected) populateFields(selected);
    setEditing(false);
  };

  const handleUnclaim = async () => {
    if (!selected || !user) return;
    setUnclaiming(true);
    try {
      const { error } = await (supabase as any)
        .from('businesses')
        .update({
          is_claimed: false,
          claimed_by: null,
          is_verified: false,
        })
        .eq('id', selected.id)
        .eq('claimed_by', user.id);

      if (error) throw error;

      toast.success(`${selected.name} has been unclaimed.`);

      // Remove from local list and redirect
      const remaining = businesses.filter(b => b.id !== selected.id);
      setBusinesses(remaining);
      if (remaining.length > 0) {
        populateFields(remaining[0]);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to unclaim business');
    } finally {
      setUnclaiming(false);
      setShowUnclaimConfirm(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user || !selected) return;
    setUploading(true);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} is too large (max 5MB)`); continue; }
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `business/${selected.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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

  if (loading) return <DashboardSkeleton />;

  if (businesses.length === 0) return (
    <>
      <Navbar />
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 5vw', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏢</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 900, marginBottom: '12px' }}>No businesses yet</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '32px', lineHeight: 1.6 }}>
          You haven't claimed any businesses yet. Find your business on AddisReview and claim it to manage your listing.
        </p>
        <Link href="/search"><button className="btn-primary">Find Your Business →</button></Link>
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

  const inputStyle = (base?: React.CSSProperties): React.CSSProperties => ({
    ...base,
    opacity: editing ? 1 : 0.75,
    pointerEvents: editing ? 'auto' : 'none',
    background: editing ? '#fff' : '#f9f9f9',
  });

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
        <style>{`
          .dash-tab:hover { background: var(--green-pale) !important; color: var(--green) !important; }
          .feature-chip:hover { border-color: var(--green) !important; }
          .photo-card:hover .photo-actions { opacity: 1 !important; }
          @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
          @media (max-width: 768px) {
            .dash-layout { grid-template-columns: 1fr !important; }
            .dash-sidebar { display: none !important; }
          }
        `}</style>

        {/* HEADER */}
        <div style={{ background: 'linear-gradient(135deg, #0e3d26, var(--green))', padding: '32px 5vw' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Owner Dashboard</div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>{selected?.name}</h1>
              <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.6)', marginTop: '4px' }}>{selected?.category_name} · {selected?.city_name}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link href={`/business/${selected?.slug}`} target="_blank" style={{ textDecoration: 'none' }}>
                <button style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: '50px', padding: '9px 18px', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                  View Public Page ↗
                </button>
              </Link>
              {editing ? (
                <>
                  <button onClick={handleCancel} style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: '50px', padding: '9px 18px', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} style={{ background: 'var(--yellow)', color: 'var(--charcoal)', border: 'none', borderRadius: '50px', padding: '9px 22px', fontSize: '.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)', opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving…' : '💾 Save Changes'}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} style={{ background: 'var(--yellow)', color: 'var(--charcoal)', border: 'none', borderRadius: '50px', padding: '9px 22px', fontSize: '.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                  ✏️ Edit Business
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="dash-layout" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '28px', maxWidth: '1200px', margin: '0 auto', padding: '32px 5vw' }}>

          {/* SIDEBAR */}
          <div className="dash-sidebar">
            {businesses.length > 1 && (
              <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border)', padding: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '10px', paddingLeft: '4px' }}>Your Businesses</div>
                {businesses.map((biz) => (
                  <button
                    key={biz.id}
                    onClick={() => selectBusiness(biz)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      width: '100%', textAlign: 'left', padding: '8px',
                      borderRadius: '10px', border: selected?.id === biz.id ? '2px solid var(--green)' : '2px solid transparent',
                      background: selected?.id === biz.id ? 'var(--green-pale)' : '#f9f9f9',
                      cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      marginBottom: '8px', transition: 'all .15s',
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #1a5c3a, #2d8657)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                      {biz.cover_photo_url ? (
                        <img src={biz.cover_photo_url} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : <span>🏢</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: selected?.id === biz.id ? 700 : 500, fontSize: '.82rem', color: selected?.id === biz.id ? 'var(--green)' : 'var(--charcoal)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {biz.name}
                      </div>
                      <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '2px' }}>{biz.category_name || 'Business'}</div>
                    </div>
                    {selected?.id === biz.id && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border)', padding: '8px' }}>
              {tabs.map(tab => (
                <button key={tab.id} className="dash-tab" onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', borderRadius: '8px', border: 'none', background: activeTab === tab.id ? 'var(--green-pale)' : 'transparent', color: activeTab === tab.id ? 'var(--green)' : 'var(--charcoal)', fontWeight: activeTab === tab.id ? 700 : 500, fontSize: '.88rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left', transition: 'all .15s', marginBottom: '2px' }}>
                  <span>{tab.emoji}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div>
            {!editing && (
              <div style={{ background: '#fff9e6', border: '1px solid var(--yellow)', borderRadius: '12px', padding: '12px 18px', marginBottom: '16px', fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>💡</span>
                <span>You are in view mode. Click <strong>✏️ Edit Business</strong> in the header to make changes.</span>
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '28px' }}>

              {/* INFO TAB */}
              {activeTab === 'info' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px' }}>Business Information</h2>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '7px', display: 'block' }}>Description</label>
                    <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell customers what makes your business special…" maxLength={500} disabled={!editing} style={inputStyle({ minHeight: '120px' })} />
                    <div style={{ fontSize: '.75rem', color: 'var(--muted)', textAlign: 'right', marginTop: '4px' }}>{description.length}/500</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '7px', display: 'block' }}>Phone Number</label>
                      <input type="tel" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251911234567" disabled={!editing} style={inputStyle()} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '7px', display: 'block' }}>Email</label>
                      <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="info@yourbusiness.com" disabled={!editing} style={inputStyle()} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '7px', display: 'block' }}>Website</label>
                    <input type="url" className="form-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourbusiness.com" disabled={!editing} style={inputStyle()} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '7px', display: 'block' }}>Address</label>
                    <input type="text" className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address" disabled={!editing} style={inputStyle()} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '7px', display: 'block' }}>Neighborhood</label>
                      <input type="text" className="form-input" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="e.g. Bole, Kazanchis" disabled={!editing} style={inputStyle()} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '7px', display: 'block' }}>Price Range</label>
                      <select className="form-input" value={priceRange} onChange={e => setPriceRange(Number(e.target.value))} disabled={!editing} style={inputStyle({ cursor: editing ? 'pointer' : 'default' })}>
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
                        <input type="text" className="form-input" value={hours[day] || ''} onChange={e => setHours(prev => ({ ...prev, [day]: e.target.value }))} placeholder="e.g. 8:00 AM - 10:00 PM or Closed" disabled={!editing} style={inputStyle({ flex: 1 })} />
                        {editing && (
                          <button onClick={() => setHours(prev => ({ ...prev, [day]: 'Closed' }))} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '50px', padding: '6px 14px', fontSize: '.78rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--muted)', flexShrink: 0 }}>
                            Closed
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {editing && (
                    <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--cream)', borderRadius: '10px', fontSize: '.8rem', color: 'var(--muted)' }}>
                      💡 Format: "8:00 AM - 10:00 PM" or type "Closed" for days you're not open.
                    </div>
                  )}
                </div>
              )}

              {/* PHOTOS TAB */}
              {activeTab === 'photos' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Photos</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '24px' }}>Photos of your business. The cover photo appears at the top of your listing.</p>
                  {editing && (
                    <>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={handlePhotoUpload} />
                      <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '28px', textAlign: 'center', cursor: 'pointer', marginBottom: '24px', transition: 'border-color .2s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div>
                        <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '4px' }}>{uploading ? 'Uploading…' : 'Click to upload photos'}</div>
                        <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>JPG, PNG or WEBP · Max 5MB each</div>
                      </div>
                    </>
                  )}
                  {photos.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                      {photos.map((url, i) => (
                        <div key={i} className="photo-card" style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '1', border: url === coverPhoto ? '3px solid var(--green)' : '2px solid transparent' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {url === coverPhoto && (
                            <div style={{ position: 'absolute', top: '6px', left: '6px', background: 'var(--green)', color: '#fff', fontSize: '.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '50px' }}>COVER</div>
                          )}
                          {editing && (
                            <div className="photo-actions" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0, transition: 'opacity .2s' }}>
                              {url !== coverPhoto && (
                                <button onClick={() => setCoverPhoto(url)} style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '50px', padding: '6px 14px', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Set as Cover</button>
                              )}
                              <button onClick={() => removePhoto(url)} style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: '50px', padding: '6px 14px', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Remove</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', background: 'var(--cream)', borderRadius: '12px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📷</div>
                      <div style={{ fontSize: '.9rem' }}>No photos yet{editing ? ' — upload some above' : ''}</div>
                    </div>
                  )}
                </div>
              )}

              {/* FEATURES TAB */}
              {activeTab === 'features' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Features & Highlights</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '24px' }}>Features that describe your business. These appear on your listing.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                    {FEATURE_SUGGESTIONS.map(f => (
                      <button key={f} className="feature-chip" onClick={() => editing && toggleFeature(f)} style={{ padding: '8px 16px', borderRadius: '50px', border: features.includes(f) ? '2px solid var(--green)' : '1.5px solid var(--border)', background: features.includes(f) ? 'var(--green-pale)' : '#fff', color: features.includes(f) ? 'var(--green)' : 'var(--charcoal)', fontFamily: 'var(--font-sans)', fontSize: '.85rem', fontWeight: 600, cursor: editing ? 'pointer' : 'default', transition: 'all .15s', opacity: editing ? 1 : 0.8 }}>
                        {features.includes(f) ? '✓ ' : ''}{f}
                      </button>
                    ))}
                  </div>
                  {editing && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                      <label style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '10px', display: 'block' }}>Add custom feature</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" className="form-input" value={customFeature} onChange={e => setCustomFeature(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomFeature()} placeholder="e.g. Rooftop View, Valet Parking…" style={{ flex: 1 }} />
                        <button onClick={addCustomFeature} className="btn-primary" style={{ borderRadius: '10px', padding: '0 20px', flexShrink: 0 }}>Add</button>
                      </div>
                    </div>
                  )}
                  {features.filter(f => !FEATURE_SUGGESTIONS.includes(f)).length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '10px' }}>Custom Features</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {features.filter(f => !FEATURE_SUGGESTIONS.includes(f)).map(f => (
                          <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--green-pale)', color: 'var(--green)', padding: '6px 14px', borderRadius: '50px', fontSize: '.82rem', fontWeight: 600 }}>
                            {f}
                            {editing && (
                              <button onClick={() => setFeatures(prev => prev.filter(x => x !== f))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: '1rem', lineHeight: 1, padding: 0 }}>×</button>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {editing && (
                <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button onClick={handleCancel} style={{ background: '#fff', border: '1.5px solid var(--border)', color: 'var(--muted)', padding: '12px 24px', borderRadius: '50px', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: '13px 32px', fontSize: '.95rem' }}>
                    {saving ? 'Saving…' : '💾 Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* DANGER ZONE — Unclaim */}
            <div style={{ marginTop: '24px', background: '#fff', borderRadius: '16px', border: '1.5px solid #fde8e8', padding: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 700, color: '#c0392b', marginBottom: '8px' }}>
                ⚠️ Unclaim This Business
              </h3>
              <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                If you've sold the business or no longer manage it, you can remove your claim. This will remove your access to this dashboard and the business will return to unclaimed status. This action cannot be undone.
              </p>

              {!showUnclaimConfirm ? (
                <button
                  onClick={() => setShowUnclaimConfirm(true)}
                  style={{ background: '#fff', color: '#c0392b', border: '1.5px solid #c0392b', borderRadius: '50px', padding: '10px 22px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}
                >
                  Unclaim {selected?.name}
                </button>
              ) : (
                <div style={{ background: '#fde8e8', borderRadius: '12px', padding: '16px 18px' }}>
                  <p style={{ fontSize: '.88rem', fontWeight: 700, color: '#c0392b', marginBottom: '12px' }}>
                    Are you sure? This will remove your access to this business dashboard.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleUnclaim}
                      disabled={unclaiming}
                      style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '50px', padding: '10px 22px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer', opacity: unclaiming ? 0.7 : 1 }}
                    >
                      {unclaiming ? 'Unclaiming…' : 'Yes, Unclaim'}
                    </button>
                    <button
                      onClick={() => setShowUnclaimConfirm(false)}
                      style={{ background: '#fff', color: 'var(--charcoal)', border: '1.5px solid var(--border)', borderRadius: '50px', padding: '10px 22px', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
