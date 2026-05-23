'use client';

// src/app/auth/reset-password/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createBrowserClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated! Redirecting…');
      setTimeout(() => router.push('/'), 1500);
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '80px 5vw' }}>
        <div style={{
          background: '#fff', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', padding: '40px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ fontSize: '2.4rem', textAlign: 'center', marginBottom: '16px' }}>🔑</div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.8rem',
            fontWeight: 900, marginBottom: '8px', textAlign: 'center',
          }}>
            Set a new password
          </h1>
          <p style={{
            color: 'var(--muted)', fontSize: '.88rem',
            marginBottom: '32px', textAlign: 'center', lineHeight: 1.6,
          }}>
            Choose a strong password for your AddisReview account.
          </p>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '.83rem', fontWeight: 600, marginBottom: '7px', display: 'block' }}>
              New Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '.83rem', fontWeight: 600, marginBottom: '7px', display: 'block' }}>
              Confirm Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Repeat your new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
            />
          </div>

          <button
            onClick={handleReset}
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: 'var(--green)', color: '#fff',
              border: 'none', borderRadius: '10px',
              fontFamily: 'var(--font-sans)', fontWeight: 700,
              fontSize: '.95rem', cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Updating…' : 'Update Password →'}
          </button>
        </div>
      </main>
    </>
  );
}
