'use client';

// src/app/admin/claims/page.tsx
// Access at: addisreviews.com/admin/claims

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';

interface Claim {
  id: string;
  business_id: string;
  full_name: string;
  role: string;
  email: string;
  phone: string;
  verification_method: string;
  status: string;
  created_at: string;
  businesses: { name: string; slug: string; category_name: string } | null;
}

interface BusinessSubmission {
  id: string;
  name: string;
  category_name: string;
  description: string;
  address: string;
  neighborhood: string;
  phone: string;
  website: string | null;
  email: string | null;
  hours: Record<string, string> | null;
  photos: string[];
  cover_photo_url: string | null;
  is_active: boolean;
  claimed_by: string | null;
  created_at: string;
  slug: string;
  submitter_email?: string;
}

export default function AdminClaimsPage() {
  const [activeTab, setActiveTab] = useState<'claims' | 'submissions'>('claims');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [submissions, setSubmissions] = useState<BusinessSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadClaims(), loadSubmissions()]);
    setLoading(false);
  };

  const loadClaims = async () => {
    const { data } = await (supabase
      .from('business_claims')
      .select('*, businesses(name, slug, category_name)')
      .order('created_at', { ascending: false }) as any);
    setClaims(data || []);
  };

  const loadSubmissions = async () => {
    // New submissions are businesses that are inactive and have a claimed_by (submitted by a user)
    const { data } = await (supabase
      .from('businesses')
      .select('*')
      .eq('is_active', false)
      .not('claimed_by', 'is', null)
      .order('created_at', { ascending: false }) as any);
    setSubmissions(data || []);
  };

  const handleClaimAction = async (claimId: string, action: 'approved' | 'rejected') => {
    setProcessing(claimId);
    try {
      const res = await fetch('/api/claim/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, action }),
      });
      if (!res.ok) throw new Error('Failed');
      await loadClaims();
      alert(`Claim ${action} successfully!`);
    } catch {
      alert('Something went wrong');
    } finally {
      setProcessing(null);
    }
  };

  const handleSubmissionAction = async (sub: BusinessSubmission, action: 'approved' | 'rejected') => {
    setProcessing(sub.id);
    try {
      if (action === 'approved') {
        // Activate the business
        const { error } = await (supabase as any)
          .from('businesses')
          .update({ is_active: true, is_verified: true })
          .eq('id', sub.id);
        if (error) throw error;

        // Get submitter email from auth
        const { data: { users } } = await supabase.auth.admin?.listUsers?.() || { data: { users: [] } };

        // Send approval email via notify API
        await fetch('/api/notify-submission-approved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: sub.name,
            businessSlug: sub.slug,
            submittedById: sub.claimed_by,
          }),
        });

        alert(`✅ "${sub.name}" is now live on AddisReview!`);
      } else {
        // Delete the rejected submission
        const { error } = await (supabase as any)
          .from('businesses')
          .delete()
          .eq('id', sub.id);
        if (error) throw error;
        alert(`"${sub.name}" has been rejected and removed.`);
      }
      await loadSubmissions();
    } catch (err: any) {
      alert('Something went wrong: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'approved') return '#1a5c3a';
    if (status === 'rejected') return '#c0392b';
    return '#d4a800';
  };

  const statusBg = (status: string) => {
    if (status === 'approved') return '#e8f5ee';
    if (status === 'rejected') return '#fdecea';
    return '#fff9e6';
  };

  const pendingClaims = claims.filter(c => c.status === 'pending').length;
  const pendingSubmissions = submissions.length;

  const tabStyle = (tab: 'claims' | 'submissions'): React.CSSProperties => ({
    padding: '10px 24px',
    borderRadius: '50px',
    border: 'none',
    background: activeTab === tab ? '#1a5c3a' : '#f5f5f5',
    color: activeTab === tab ? '#fff' : '#6b6b6b',
    fontFamily: 'DM Sans, system-ui, sans-serif',
    fontWeight: 700,
    fontSize: '.88rem',
    cursor: 'pointer',
    transition: 'all .2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  });

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 5vw', fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.8rem', fontWeight: 900, marginBottom: '4px' }}>
            Admin Panel
          </h1>
          <div style={{ color: '#6b6b6b', fontSize: '.88rem' }}>
            {pendingClaims} pending claims · {pendingSubmissions} pending submissions
          </div>
        </div>
        <button onClick={loadAll} style={{ background: '#f5f5f5', border: '1px solid #e8ddd0', borderRadius: '50px', padding: '8px 18px', cursor: 'pointer', fontSize: '.85rem', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          ↻ Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
        <button style={tabStyle('claims')} onClick={() => setActiveTab('claims')}>
          🏢 Business Claims
          {pendingClaims > 0 && (
            <span style={{ background: '#f5c518', color: '#1c1c1c', borderRadius: '50px', padding: '2px 8px', fontSize: '.72rem', fontWeight: 900 }}>
              {pendingClaims}
            </span>
          )}
        </button>
        <button style={tabStyle('submissions')} onClick={() => setActiveTab('submissions')}>
          ➕ New Submissions
          {pendingSubmissions > 0 && (
            <span style={{ background: '#f5c518', color: '#1c1c1c', borderRadius: '50px', padding: '2px 8px', fontSize: '.72rem', fontWeight: 900 }}>
              {pendingSubmissions}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b6b' }}>Loading…</div>
      ) : (
        <>
          {/* CLAIMS TAB */}
          {activeTab === 'claims' && (
            <>
              {claims.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b6b' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                  <div>No claims yet</div>
                </div>
              ) : claims.map(claim => (
                <div key={claim.id} style={{ background: '#fff', border: '1px solid #e8ddd0', borderRadius: '16px', padding: '24px', marginBottom: '16px', borderLeft: `4px solid ${statusColor(claim.status)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
                        {claim.businesses?.name || 'Unknown Business'}
                      </div>
                      <div style={{ fontSize: '.78rem', color: '#6b6b6b' }}>
                        {claim.businesses?.category_name} · Claimed {new Date(claim.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{ background: statusBg(claim.status), color: statusColor(claim.status), padding: '4px 14px', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                      {claim.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { label: 'Name', value: claim.full_name },
                      { label: 'Role', value: claim.role },
                      { label: 'Email', value: claim.email },
                      { label: 'Phone', value: claim.phone },
                      { label: 'Verified via', value: claim.verification_method?.toUpperCase() },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ fontSize: '.7rem', fontWeight: 700, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '2px' }}>{label}</div>
                        <div style={{ fontSize: '.88rem', fontWeight: 500 }}>{value || '—'}</div>
                      </div>
                    ))}
                  </div>

                  {claim.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button onClick={() => handleClaimAction(claim.id, 'approved')} disabled={processing === claim.id}
                        style={{ background: '#1a5c3a', color: '#fff', border: 'none', borderRadius: '50px', padding: '10px 24px', fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer', opacity: processing === claim.id ? 0.6 : 1 }}>
                        {processing === claim.id ? 'Processing…' : '✓ Approve'}
                      </button>
                      <button onClick={() => handleClaimAction(claim.id, 'rejected')} disabled={processing === claim.id}
                        style={{ background: '#fff', color: '#c0392b', border: '1.5px solid #c0392b', borderRadius: '50px', padding: '10px 24px', fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer', opacity: processing === claim.id ? 0.6 : 1 }}>
                        ✕ Reject
                      </button>
                      <a href={`https://www.addisreviews.com/business/${claim.businesses?.slug}`} target="_blank" rel="noreferrer"
                        style={{ background: '#f5f5f5', color: '#1c1c1c', border: '1px solid #e8ddd0', borderRadius: '50px', padding: '10px 20px', fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 600, fontSize: '.88rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                        View Business ↗
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* SUBMISSIONS TAB */}
          {activeTab === 'submissions' && (
            <>
              {submissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b6b' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                  <div>No new business submissions yet</div>
                </div>
              ) : submissions.map(sub => (
                <div key={sub.id} style={{ background: '#fff', border: '1px solid #e8ddd0', borderRadius: '16px', padding: '24px', marginBottom: '16px', borderLeft: '4px solid #d4a800' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
                        {sub.name}
                      </div>
                      <div style={{ fontSize: '.78rem', color: '#6b6b6b' }}>
                        {sub.category_name} · Submitted {new Date(sub.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{ background: '#fff9e6', color: '#d4a800', padding: '4px 14px', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                      Pending Review
                    </span>
                  </div>

                  {/* Photo */}
                  {sub.cover_photo_url && (
                    <img src={sub.cover_photo_url} alt={sub.name} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '16px' }} />
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    {[
                      { label: 'Category', value: sub.category_name },
                      { label: 'Address', value: sub.address },
                      { label: 'Neighborhood', value: sub.neighborhood },
                      { label: 'Phone', value: sub.phone },
                      { label: 'Website', value: sub.website || '—' },
                      { label: 'Email', value: sub.email || '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ fontSize: '.7rem', fontWeight: 700, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '2px' }}>{label}</div>
                        <div style={{ fontSize: '.88rem', fontWeight: 500 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {sub.description && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '.7rem', fontWeight: 700, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '4px' }}>Description</div>
                      <div style={{ fontSize: '.88rem', color: '#444', lineHeight: 1.6 }}>{sub.description}</div>
                    </div>
                  )}

                  {sub.hours && Object.keys(sub.hours).length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '.7rem', fontWeight: 700, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '8px' }}>Hours</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '4px' }}>
                        {Object.entries(sub.hours).map(([day, hours]) => (
                          <div key={day} style={{ fontSize: '.82rem', color: '#555' }}>
                            <strong style={{ textTransform: 'capitalize' }}>{day}:</strong> {hours}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e8ddd0' }}>
                    <button onClick={() => handleSubmissionAction(sub, 'approved')} disabled={processing === sub.id}
                      style={{ background: '#1a5c3a', color: '#fff', border: 'none', borderRadius: '50px', padding: '10px 24px', fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer', opacity: processing === sub.id ? 0.6 : 1 }}>
                      {processing === sub.id ? 'Processing…' : '✓ Approve & Publish'}
                    </button>
                    <button onClick={() => handleSubmissionAction(sub, 'rejected')} disabled={processing === sub.id}
                      style={{ background: '#fff', color: '#c0392b', border: '1.5px solid #c0392b', borderRadius: '50px', padding: '10px 24px', fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer', opacity: processing === sub.id ? 0.6 : 1 }}>
                      ✕ Reject & Delete
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </main>
  );
}
