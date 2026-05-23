'use client';

// src/app/auth/confirm/page.tsx
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';

function ConfirmHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your account…');

  useEffect(() => {
    async function confirm() {
      const tokenHash = searchParams.get('token_hash');
      const code = searchParams.get('code');
      const type = searchParams.get('type') || '';
      const redirect = searchParams.get('redirect') || '/';

      try {
        if (tokenHash) {
          // Determine type — recovery for password reset, email for signup confirmation
          const otpType = type === 'recovery' ? 'recovery' : 'email';

          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType as any,
          });

          if (error) {
            setStatus('error');
            setMessage(error.message || 'Link failed. It may have expired — request a new one.');
            return;
          }

          // Password recovery — go to reset page
          if (otpType === 'recovery') {
            router.push('/auth/reset-password');
            return;
          }

          // Email confirmation
          setStatus('success');
          setMessage('Email confirmed! Redirecting you…');
          setTimeout(() => router.push(redirect), 1500);

        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            setStatus('error');
            setMessage(error.message || 'Login failed. Please try again.');
            return;
          }

          if (type === 'recovery') {
            router.push('/auth/reset-password');
            return;
          }

          setStatus('success');
          setMessage('Logged in! Redirecting you…');
          setTimeout(() => router.push(redirect), 1000);

        } else {
          setStatus('error');
          setMessage('Invalid confirmation link.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    }

    confirm();
  }, []);

  return (
    <main style={{ maxWidth: '480px', margin: '0 auto', padding: '80px 5vw', textAlign: 'center' }}>
      {status === 'loading' && (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 900, marginBottom: '12px' }}>
            Just a moment…
          </h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{message}</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✅</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 900, marginBottom: '12px', color: 'var(--green)' }}>
            You're confirmed!
          </h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{message}</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 900, marginBottom: '12px' }}>
            Link expired
          </h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>{message}</p>
          <button
            onClick={() => router.push('/auth')}
            style={{
              background: 'var(--green)', color: '#fff', border: 'none',
              borderRadius: '50px', padding: '12px 28px',
              fontFamily: 'var(--font-sans)', fontWeight: 700,
              fontSize: '.95rem', cursor: 'pointer',
            }}
          >
            Back to Sign In
          </button>
        </>
      )}
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--muted)' }}>
          Loading…
        </div>
      }>
        <ConfirmHandler />
      </Suspense>
    </>
  );
}
