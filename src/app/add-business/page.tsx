'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createBrowserClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { User } from '@supabase/supabase-js';

const CATEGORIES = [
  { name: 'Restaurants', emoji: '🍛' },
  { name: 'Coffee & Buna', emoji: '☕' },
  { name: 'Traditional Restaurants', emoji: '🍛' },
  { name: 'Hotels', emoji: '🏨' },
  { name: 'Juice Bars', emoji: '🥤' },
  { name: 'Spas', emoji: '💆' },
  { name: 'Shopping', emoji: '🛍️' },
  { name: 'Entertainment', emoji: '🎵' },
  { name: 'Healthcare', emoji: '🏥' },
  { name: 'Services', emoji: '🔧' },
  { name: 'Guesthouses', emoji: '🏠' },
  { name: 'Gyms', emoji: '💪' },
  { name: 'Bakeries', emoji: '🥐' },
  { name: 'Supermarkets', emoji: '🛒' },
  { name: 'Hospitals & Clinics', emoji: '🏥' },
  { name: 'Wedding Halls', emoji: '💒' },
  { name: 'Butcher Shops', emoji: '🥩' },
  { name: 'Photographers', emoji: '📷' },
  { name: 'Car Dealerships', emoji: '🚗' },
  { name: 'Rooftop Bars & Lounges', emoji: '🌆' },
  { name: 'Clubs & Nightlife', emoji: '🎵' },
  { name: 'Pharmacies', emoji: '💊' },
  { name: 'Banks & ATMs', emoji: '🏦' },
  { name: 'Beauty Salons', emoji: '💅' },
  { name: 'Barber Shops', emoji: '✂️' },
  { name: 'Shopping Malls', emoji: '🏬' },
  { name: 'Clothing Stores', emoji: '👗' },
  { name: 'Shoe Stores', emoji: '👟' },
  { name: 'Dental Clinics', emoji: '🦷' },
  { name: 'Opticians', emoji: '👓' },
  { name: 'Car Repair', emoji: '🔧' },
  { name: 'Gas Stations', emoji: '⛽' },
  { name: 'Museums', emoji: '🏛️' },
  { name: 'Movie Theaters', emoji: '🎬' },
  { name: 'Churches & Mosques', emoji: '🕌' },
  { name: 'Schools & Universities', emoji: '🎓' },
  { name: 'Travel Agencies', emoji: '✈️' },
  { name: 'Airlines & Ticketing', emoji: '🛫' },
  { name: 'Real Estate', emoji: '🏢' },
  { name: 'Laundry Services', emoji: '👕' },
  { name: 'Printing & Copy Shops', emoji: '🖨️' },
  { name: 'Internet Cafes', emoji: '💻' },
  { name: 'Craft & Souvenir Shops', emoji: '🎨' },
  { name: 'Bookstores', emoji: '📚' },
  { name: 'Cultural Centers', emoji: '🎭' },
];

const NEIGHBORHOODS = [
  'Bole', 'Piassa', 'Kazanchis', 'Megenagna', 'CMC', 'Sarbet',
  'Merkato', 'Lideta', 'Semen Mazoria', 'Gerji', 'Ayat',
  'Gofa', 'Jemo', 'Kotebe', 'Kolfe', 'Akaki', 'Mexico',
  'Urael', 'Wello Sefer', 'Lamberet', 'Kaliti', 'Lafto',
  'Nefas Silk', 'Lebu', 'Addis Ketema', 'Kirkos', 'Arada',
  'Gulele', 'Yeka', 'Bole Bulbulo', 'Hayahulet', 'Atlas',
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface HoursEntry { open: string; close: string; closed: boolean; }

export default function AddBusinessPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Step 1
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  // Step 2
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [customNeighborhood, setCustomNeighborhood] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');

  // Step 3
  const [hours, setHours] = useState<Record<string, HoursEntry>>(
    Object.fromEntries(DAYS.map(d => [d, { open: '08:00', close: '20:00', closed: false }]))
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user) {
        router.push('/auth?redirect=/add-business&reason=add');
        return;
      }
      setUser(data.session.user);
      setAuthLoading(false);
    });
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (photos.length >= MAX_PHOTOS) { toast.error(`Max ${MAX_PHOTOS} photos`); break; }
      if (file.size > MAX_FILE_SIZE) { toast.error(`${file.name} too large (max 5MB)`); continue; }
      setPhotos(prev => [...prev, file]);
      setPhotoPreviews(prev => [...prev, URL.createObjectURL(file)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (i: number) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== i));
    setPhotoPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const validateStep1 = () => {
    if (!name.trim()) { toast.error('Please enter the business name'); return false; }
    if (!category) { toast.error('Please select a category'); return false; }
    if (!description.trim() || description.length < 20) { toast.error('Please enter a description (at least 20 characters)'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!address.trim()) { toast.error('Please enter the address'); return false; }
    if (!neighborhood) { toast.error('Please select a neighborhood'); return false; }
    if (neighborhood === 'Other' && !customNeighborhood.trim()) { toast.error('Please enter your neighborhood name'); return false; }
    if (!phone1.trim()) { toast.error('Please enter a primary phone number'); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Upload photos if any
      const photoUrls: string[] = [];
      for (const file of photos) {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `business-submissions/${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('review-photos').upload(path, file, { cacheControl: '3600', upsert: false });
        if (!error) {
          const { data: urlData } = supabase.storage.from('review-photos').getPublicUrl(path);
          photoUrls.push(urlData.publicUrl);
        }
      }

      // Build hours object
      const hoursObj: Record<string, string> = {};
      for (const day of DAYS) {
        const h = hours[day];
        if (h.closed) {
          hoursObj[day] = 'Closed';
        } else {
          // Convert 24h to 12h format like "8:00am–8:00pm"
          const fmt = (t: string) => {
            const [hh, mm] = t.split(':').map(Number);
            const ampm = hh >= 12 ? 'pm' : 'am';
            const h12 = hh % 12 || 12;
            return `${h12}:${mm.toString().padStart(2, '0')}${ampm}`;
          };
          hoursObj[day] = `${fmt(h.open)}–${fmt(h.close)}`;
        }
      }

      const finalNeighborhood = neighborhood === 'Other' ? customNeighborhood.trim() : neighborhood;

      // Build phone string — combine primary and secondary
      const phoneStr = phone2.trim() ? `${phone1.trim()} / ${phone2.trim()}` : phone1.trim();

      // Insert into businesses table as inactive (pending review)
      const { error } = await (supabase as any).from('businesses').insert({
        name: name.trim(),
        category_name: category,
        city_name: 'Addis Ababa',
        description: description.trim(),
        address: address.trim(),
        neighborhood: finalNeighborhood,
        phone: phoneStr,
        website: website.trim() || null,
        email: email.trim() || null,
        hours: hoursObj,
        photos: photoUrls,
        cover_photo_url: photoUrls[0] || null,
        is_active: false,      // pending admin approval
        is_verified: false,
        is_featured: false,
        is_claimed: true,
        claimed_by: user!.id,
        slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now(),
      });

      if (error) throw error;

      // Send notification email to admin via your contact API
      await fetch('/api/notify-new-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: name.trim(),
          submittedBy: user!.email,
          category,
          neighborhood: finalNeighborhood,
        }),
      }).catch(() => {}); // Don't fail if email fails

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      toast.error(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)',
    borderRadius: '10px', fontSize: '.93rem', fontFamily: 'var(--font-sans)',
    outline: 'none', background: '#fff', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '.85rem', fontWeight: 700, marginBottom: '7px', display: 'block', color: 'var(--charcoal)',
  };

  const fieldStyle: React.CSSProperties = { marginBottom: '20px' };

  if (authLoading) return (
    <>
      <Navbar />
      <div style={{ padding: '80px', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
      <Footer />
    </>
  );

  if (submitted) return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 128px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 5vw', background: 'var(--warm-white)' }}>
        <div style={{ maxWidth: '520px', width: '100%', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '48px 40px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 900, marginBottom: '14px', color: 'var(--charcoal)' }}>
            Business Submitted!
          </h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '12px', fontSize: '.95rem' }}>
            Thank you for submitting <strong>{name}</strong> to AddisReview.
          </p>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px', fontSize: '.95rem' }}>
            Your business is currently under review. We'll send a confirmation email to <strong>{user?.email}</strong> within 48 hours once it's approved and live on the site.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/')} style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '50px', padding: '12px 28px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '.93rem', cursor: 'pointer' }}>
              Back to Home
            </button>
            <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: '50px', padding: '12px 28px', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '.93rem', cursor: 'pointer', color: 'var(--charcoal)' }}>
              My Dashboard
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--warm-white)', minHeight: 'calc(100vh - 128px)', padding: '48px 5vw' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>
              Add Your Business
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '.93rem', lineHeight: 1.6 }}>
              List your business on AddisReview for free. It takes about 3 minutes.
            </p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '36px' }}>
            {[
              { n: 1, label: 'Basic Info' },
              { n: 2, label: 'Location & Contact' },
              { n: 3, label: 'Hours & Photos' },
            ].map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: step >= s.n ? 'var(--green)' : 'var(--border)',
                    color: step >= s.n ? '#fff' : 'var(--muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '.9rem', transition: 'all .2s',
                  }}>{step > s.n ? '✓' : s.n}</div>
                  <span style={{ fontSize: '.72rem', fontWeight: 600, color: step >= s.n ? 'var(--green)' : 'var(--muted)', whiteSpace: 'nowrap' }}>{s.label}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: '2px', background: step > s.n ? 'var(--green)' : 'var(--border)', margin: '0 8px', marginBottom: '22px', transition: 'all .2s' }} />}
              </div>
            ))}
          </div>

          {/* Card */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                  Basic Information
                </h2>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Business Name <span style={{ color: 'red' }}>*</span></label>
                  <input style={inputStyle} placeholder="e.g. Tomoca Coffee Piassa" value={name} onChange={e => setName(e.target.value)} />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Category <span style={{ color: 'red' }}>*</span></label>
                  <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">Select a category…</option>
                    {CATEGORIES.map(c => (
                      <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Business Description <span style={{ color: 'red' }}>*</span></label>
                  <textarea
                    style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                    placeholder="Describe your business — what you offer, what makes you special, who your customers are…"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    maxLength={500}
                  />
                  <div style={{ fontSize: '.75rem', color: 'var(--muted)', textAlign: 'right', marginTop: '4px' }}>{description.length}/500</div>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                  Location & Contact
                </h2>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Street Address <span style={{ color: 'red' }}>*</span></label>
                  <input style={inputStyle} placeholder="e.g. Bole Road, near Edna Mall" value={address} onChange={e => setAddress(e.target.value)} />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Neighborhood <span style={{ color: 'red' }}>*</span></label>
                  <select style={inputStyle} value={neighborhood} onChange={e => { setNeighborhood(e.target.value); setCustomNeighborhood(''); }}>
                    <option value="">Select a neighborhood…</option>
                    {NEIGHBORHOODS.sort().map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                    <option value="Other">Other (type it in)</option>
                  </select>
                  {neighborhood === 'Other' && (
                    <input
                      style={{ ...inputStyle, marginTop: '10px' }}
                      placeholder="Enter your neighborhood name"
                      value={customNeighborhood}
                      onChange={e => setCustomNeighborhood(e.target.value)}
                    />
                  )}
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Primary Phone Number <span style={{ color: 'red' }}>*</span></label>
                  <input style={inputStyle} placeholder="e.g. +251 911 123 456" value={phone1} onChange={e => setPhone1(e.target.value)} />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Secondary Phone Number <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
                  <input style={inputStyle} placeholder="e.g. +251 115 123 456" value={phone2} onChange={e => setPhone2(e.target.value)} />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Website <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
                  <input style={inputStyle} placeholder="e.g. https://yourbusiness.com" value={website} onChange={e => setWebsite(e.target.value)} />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Business Email <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
                  <input style={inputStyle} placeholder="e.g. info@yourbusiness.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                  Hours & Photos
                </h2>

                {/* Hours */}
                <div style={{ marginBottom: '28px' }}>
                  <label style={labelStyle}>Opening Hours <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {DAYS.map(day => (
                      <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ width: '100px', fontSize: '.88rem', fontWeight: 600, color: 'var(--charcoal)' }}>{DAY_LABELS[day]}</div>
                        {hours[day].closed ? (
                          <span style={{ fontSize: '.85rem', color: 'var(--muted)', flex: 1 }}>Closed</span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <input type="time" value={hours[day].open} onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], open: e.target.value } }))}
                              style={{ padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '.85rem', fontFamily: 'var(--font-sans)' }} />
                            <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>to</span>
                            <input type="time" value={hours[day].close} onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], close: e.target.value } }))}
                              style={{ padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '.85rem', fontFamily: 'var(--font-sans)' }} />
                          </div>
                        )}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.82rem', color: 'var(--muted)', cursor: 'pointer', marginLeft: 'auto' }}>
                          <input type="checkbox" checked={hours[day].closed}
                            onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], closed: e.target.checked } }))}
                            style={{ accentColor: 'var(--green)' }} />
                          Closed
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Photos */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={labelStyle}>Photos <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional, max {MAX_PHOTOS})</span></label>

                  {photoPreviews.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                      {photoPreviews.map((url, i) => (
                        <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button onClick={() => removePhoto(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {photos.length < MAX_PHOTOS && (
                    <>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={handlePhotoSelect} />
                      <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div>
                        <p style={{ fontSize: '.88rem', color: 'var(--muted)' }}>Click to add photos ({photos.length}/{MAX_PHOTOS})</p>
                        <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '4px' }}>JPG, PNG or WEBP · Max 5MB each</p>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              {step > 1 ? (
                <button onClick={handleBack} style={{ background: '#fff', border: '1.5px solid var(--border)', color: 'var(--charcoal)', padding: '12px 24px', borderRadius: '50px', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer' }}>
                  ← Back
                </button>
              ) : <div />}

              {step < 3 ? (
                <button onClick={handleNext} style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '50px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '.93rem', cursor: 'pointer' }}>
                  Next →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting} style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '50px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '.93rem', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Submitting…' : 'Submit for Review →'}
                </button>
              )}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--muted)', marginTop: '20px', lineHeight: 1.6 }}>
            By submitting, you confirm this is a real business and you have the right to list it. Our team will review your submission within 48 hours.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
