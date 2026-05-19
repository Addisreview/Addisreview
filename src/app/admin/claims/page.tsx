'use client';

// src/app/admin/claims/page.tsx
// Protect this by only sharing the URL with yourself
// Access at: addisreview.co/admin/claims?key=YOUR_DB_SERVICE_KEY

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

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoading(true);
    const { data } = await (supabase
      .from('business_claims')
      .select('*, businesses(name, slug, category_name)')
      .order('created_at', { ascending: false }) as any);
    setClaims(data || []);
    setLoading(false);
  };

  const handleAction = async (claimId: string, action: 'approved' | 'rejected') => {
    setProcessing(claimId);
    try {
      const res = await fetch('/api/claim/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DB_ANON || ''}`,
        },
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

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 5vw', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.8rem', fontWeight: 900, marginBottom: '4px' }}>
            Business Claims
          </h1>
          <div style={{ color: '#6b6b6b', fontSize: '.88rem' }}>
            {claims.filter(c => c.status === 'pending').length} pending · {claims.length} total
          </div>
        </div>
        <button
          onClick={loadClaims}
          style={{ background: '#f5f5f5', border: '1px solid #e8ddd0', borderRadius: '50px', padding: '8px 18px', cursor: 'pointer', fontSize: '.85rem', fontFamily: 'DM Sans, system-ui, sans-serif' }}
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b6b' }}>Loading…</div>
      ) : claims.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b6b' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
          <div>No claims yet</div>
        </div>
      ) : claims.map(claim => (
        <div
          key={claim.id}
          style={{
            background: '#fff',
            border: '1px solid #e8ddd0',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '16px',
            borderLeft: `4px solid ${statusColor(claim.status)}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
                {claim.businesses?.name || 'Unknown Business'}
              </div>
              <div style={{ fontSize: '.78rem', color: '#6b6b6b' }}>
                {claim.businesses?.category_name} · Claimed {new Date(claim.created_at).toLocaleDateString()}
              </div>
            </div>
            <span style={{
              background: statusBg(claim.status),
              color: statusColor(claim.status),
              padding: '4px 14px',
              borderRadius: '50px',
              fontSize: '.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.5px',
            }}>
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
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleAction(claim.id, 'approved')}
                disabled={processing === claim.id}
                style={{
                  background: '#1a5c3a', color: '#fff', border: 'none',
                  borderRadius: '50px', padding: '10px 24px',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                  fontWeight: 700, fontSize: '.88rem', cursor: 'pointer',
                  opacity: processing === claim.id ? 0.6 : 1,
                }}
              >
                {processing === claim.id ? 'Processing…' : '✓ Approve'}
              </button>
              <button
                onClick={() => handleAction(claim.id, 'rejected')}
                disabled={processing === claim.id}
                style={{
                  background: '#fff', color: '#c0392b',
                  border: '1.5px solid #c0392b',
                  borderRadius: '50px', padding: '10px 24px',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                  fontWeight: 700, fontSize: '.88rem', cursor: 'pointer',
                  opacity: processing === claim.id ? 0.6 : 1,
                }}
              >
                ✕ Reject
              </button>
              <a
                href={`https://addisreview.co/business/${claim.businesses?.slug}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#f5f5f5', color: '#1c1c1c',
                  border: '1px solid #e8ddd0',
                  borderRadius: '50px', padding: '10px 20px',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                  fontWeight: 600, fontSize: '.88rem', cursor: 'pointer',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                }}
              >
                View Business ↗
              </a>
            </div>
          )}
        </div>
      ))}
    </main>
  );
}
