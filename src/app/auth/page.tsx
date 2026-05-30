'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { createBrowserClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';

type Tab = 'signup' | 'login' | 'forgot';

const REASON_BANNERS: Record<string, { emoji: string; text: string }> = {
  review:    { emoji: '✏️', text: 'Sign up or log in to write a review.' },
  claim:     { emoji: '🏢', text: 'Sign up or log in to claim your business.' },
  add:       { emoji: '➕', text: 'Sign up or log in to add your business.' },
  dashboard: { emoji: '📊', text: 'Sign up or log in to access your business dashboard.' },
};

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();
  const [tab, setTab] = useState<Tab>('signup');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [userId, setUserId] = useState<string | null>(null);

  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [phone, setPhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/';
  const reason = searchParams.get('reason') || '';
  const banner = REASON_BANNERS[reason] || null;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOwner, setIsOwner] = useState(reason === 'claim' || reason === 'add' || reason === 'dashboard');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(redirectTo);
    });
  }, []);

  const handleGoogleAuth = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}` },
    });
    if (error) { toast.error(error.message); setLoading(false); }
  };

  const handleSignUp = async () => {
    if (!fullName.trim()) { toast.error('Please enter your name'); return; }
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);

    try {
      const checkRes = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const { exists } = await checkRes.json();
      if (exists) {
        toast.error('An account with this email already exists. Please log in instead.');
        setTab('login');
        setLoading(false);
        return;
      }
    } catch {}

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName, is_business_owner: isOwner },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      const newUserId = data.user?.id || null;
      setUserId(newUserId);

      if (referralCode && newUserId) {
        fetch('/api/process-referral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referralCode, newUserId }),
        }).catch(err => console.error('process-referral failed:', err));
      }

      setStep(2);
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setProfileLoading(true);

    await fetch('/api/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        gender: gender || null,
        phone: phone.trim() || null,
        avatarUrl: null,
      }),
    });

    toast.success('Account created! Check your email to confirm. 🇪🇹');
    setProfileLoading(false);
    router.push(redirectTo);
  };

  const handleSkipProfile = () => {
    toast.success('Account created! Check your email to confirm. 🇪🇹');
    router.push(redirectTo);
  };

  const handleLogIn = async () => {
    if (!email.trim() || !password) { toast.error('Please enter your email and password'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); }
    else { toast.success('Welcome back! 🇪🇹'); router.push(redirectTo); }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) { toast.error('Please enter your email address first'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery&redirect=/`,
    });
    if (error) { toast.error(error.message); }
    else { toast.success('Password reset email sent! Check your inbox.'); setTab('login'); }
    setLoading(false);
  };

  if (step === 2) {
    return (
      <>
        <style>{`
          @media (max-width: 768px) {
            .auth-layout { grid-template-columns: 1fr !important; }
            .auth-left { display: none !important; }
            .auth-right { padding: 32px 24px !important; }
          }
        `}</style>
        <div className="auth-layout" style={{ minHeight: 'calc(100vh - 64px)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div className="auth-left" style={{
            background: 'linear-gradient(145deg,var(--green) 0%,#0e3d26 100%)',
            padding: '60px', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 900, color: 'var(--yellow)', marginBottom: '28px' }}>
                AddisReview<span style={{ color: 'rgba(255,255,255,.6)', fontStyle: 'italic' }}>.</span>
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff', lineHeight: 1.3, marginBottom: '16px' }}>
                Almost there! 🎉
              </div>
              <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.92rem', lineHeight: 1.6 }}>
                Complete your profile so the community knows who you are when you write reviews.
              </div>
            </div>
          </div>

          <div className="auth-right" style={{ padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--warm-white)' }}>
            <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.78rem', fontWeight: 700 }}>✓</div>
                <div style={{ flex: 1, height: '2px', background: 'var(--green)', borderRadius: '2px' }} />
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.78rem', fontWeight: 700 }}>2</div>
              </div>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '6px' }}>Complete your profile</h2>
              <p style={{ color: 'var(--muted)', fontSize: '.88rem', marginBottom: '32px' }}>This helps others recognise you. You can always update this later.</p>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '.83rem', fontWeight: 600, marginBottom: '12px', display: 'block' }}>Gender</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {(['female', 'male'] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => setGender(gender === g ? null : g)}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '.9rem',
                        border: gender === g ? '2px solid var(--green)' : '1.5px solid var(--border)',
                        background: gender === g ? 'rgba(26,92,58,.07)' : '#fff',
                        color: gender === g ? 'var(--green)' : 'var(--charcoal)',
                        transition: 'all .2s',
                      }}
                    >
                      {g === 'female' ? '👩 Female' : '👨 Male'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '.83rem', fontWeight: 600, marginBottom: '7px', display: 'block' }}>
                  Phone Number <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+251 91 234 5678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <button
                onClick={handleProfileSave}
                disabled={profileLoading}
                style={{ width: '100%', padding: '14px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '.95rem', cursor: 'pointer', marginBottom: '12px' }}
              >
                {profileLoading ? 'Saving…' : 'Save & Continue →'}
              </button>
              <button
                onClick={handleSkipProfile}
                style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '.88rem', cursor: 'pointer' }}
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .auth-layout { grid-template-columns: 1fr !important; }
          .auth-left { display: none !important; }
          .auth-right { padding: 32px 24px !important; }
        }
      `}</style>
      <div className="auth-layout" style={{ minHeight: 'calc(100vh - 64px)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

        <div className="auth-left" style={{
          background: 'linear-gradient(145deg,var(--green) 0%,#0e3d26 100%)',
          padding: '60px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 900, color: 'var(--yellow)', marginBottom: '28px' }}>
              AddisReview<span style={{ color: 'rgba(255,255,255,.6)', fontStyle: 'italic' }}>.</span>
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff', lineHeight: 1.3, marginBottom: '16px' }}>
              Ethiopia's most <em style={{ color: 'var(--yellow)', fontStyle: 'italic' }}>trusted</em> local guide
            </div>
            <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.92rem', lineHeight: 1.6, marginBottom: '36px' }}>
              Join thousands of Ethiopians discovering and reviewing the best restaurants, hotels, and businesses across the country.
            </div>
            {[
              'Write reviews for places you love',
              'Discover hidden gems in Addis Ababa',
              'Claim and manage your business listing',
              'Help your community make better choices',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '.7rem', color: 'var(--charcoal)', fontWeight: 700 }}>✓</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,.8)', fontSize: '.88rem' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-right" style={{ padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--warm-white)' }}>
          <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>

            {banner && (
              <div style={{
                background: 'var(--green-pale)', border: '1px solid rgba(26,92,58,.2)',
                borderRadius: '12px', padding: '14px 18px', marginBottom: '24px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <span style={{ fontSize: '1.3rem' }}>{banner.emoji}</span>
                <span style={{ fontSize: '.88rem', color: 'var(--charcoal)', fontWeight: 500 }}>{banner.text}</span>
              </div>
            )}

            {tab !== 'forgot' && (
              <div style={{ display: 'flex', background: '#fff', borderRadius: '10px', padding: '4px', marginBottom: '28px', border: '1px solid var(--border)' }}>
                {(['signup', 'login'] as Tab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                    background: tab === t ? 'var(--green)' : 'transparent',
                    color: tab === t ? '#fff' : 'var(--muted)',
                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', transition: 'all .2s',
                  }}>
                    {t === 'signup' ? 'Sign Up' : 'Log In'}
                  </button>
                ))}
              </div>
            )}

            {tab !== 'forgot' && (
              <>
                <button onClick={handleGoogleAuth} disabled={loading} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '10px', padding: '13px', borderRadius: '10px',
                  border: '1.5px solid var(--border)', background: '#fff',
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '.9rem',
                  cursor: 'pointer', marginBottom: '14px',
                }}>
                  🌐 Continue with Google
                </button>
                <div style={{ textAlign: 'center', position: 'relative', margin: '20px 0' }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border)' }} />
                  <span style={{ background: 'var(--warm-white)', padding: '0 14px', position: 'relative', fontSize: '.82rem', color: 'var(--muted)' }}>
                    or {tab === 'signup' ? 'sign up' : 'log in'} with email
                  </span>
                </div>
              </>
            )}

            {tab === 'signup' && (
              <>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '6px' }}>Create your account</h2>
                <p style={{ color: 'var(--muted)', fontSize: '.88rem', marginBottom: '28px' }}>Free forever. No credit card needed.</p>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '.83rem', fontWeight: 600, marginBottom: '7px', display: 'block' }}>Full Name</label>
                  <input type="text" className="form-input" placeholder="Abebe Girma" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '.83rem', fontWeight: 600, marginBottom: '7px', display: 'block' }}>Email Address</label>
                  <input type="email" className="form-input" placeholder="abebe@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '.83rem', fontWeight: 600, marginBottom: '7px', display: 'block' }}>Referral Code <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
                  <input type="text" className="form-input" placeholder="Referral code (optional)" value={referralCode} onChange={e => setReferralCode(e.target.value)} />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '.83rem', fontWeight: 600, marginBottom: '7px', display: 'block' }}>Password</label>
                  <input type="password" className="form-input" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '.83rem', fontWeight: 600, marginBottom: '7px', display: 'block' }}>I am a…</label>
                  <select className="form-input" value={isOwner ? 'owner' : 'user'} onChange={e => setIsOwner(e.target.value === 'owner')} style={{ cursor: 'pointer' }}>
                    <option value="user">Regular user (find & review places)</option>
                    <option value="owner">Business owner (manage my listing)</option>
                  </select>
                </div>
                <button onClick={handleSignUp} disabled={loading} style={{ width: '100%', padding: '14px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '.95rem', cursor: 'pointer' }}>
                  {loading ? 'Creating…' : 'Create Account →'}
                </button>
                <div style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--muted)', marginTop: '20px' }}>
                  By signing up you agree to our <span style={{ color: 'var(--green)', fontWeight: 600, cursor: 'pointer' }}>Terms</span> & <span style={{ color: 'var(--green)', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>
                </div>
              </>
            )}

            {tab === 'login' && (
              <>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '6px' }}>Welcome back</h2>
                <p style={{ color: 'var(--muted)', fontSize: '.88rem', marginBottom: '28px' }}>Log in to your AddisReview account.</p>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '.83rem', fontWeight: 600, marginBottom: '7px', display: 'block' }}>Email Address</label>
                  <input type="email" className="form-input" placeholder="abebe@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '.83rem', fontWeight: 600, marginBottom: '7px', display: 'block' }}>Password</label>
                  <input type="password" className="form-input" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogIn()} />
                </div>
                <button onClick={handleLogIn} disabled={loading} style={{ width: '100%', padding: '14px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '.95rem', cursor: 'pointer' }}>
                  {loading ? 'Logging in…' : 'Log In →'}
                </button>
                <div style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--muted)', marginTop: '20px' }}>
                  <span onClick={() => setTab('forgot')} style={{ color: 'var(--green)', fontWeight: 600, cursor: 'pointer' }}>Forgot your password?</span>
                </div>
              </>
            )}

            {tab === 'forgot' && (
              <>
                <button onClick={() => setTab('login')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '.88rem', marginBottom: '24px', padding: 0, fontFamily: 'var(--font-sans)' }}>
                  ← Back to login
                </button>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '6px' }}>Reset your password</h2>
                <p style={{ color: 'var(--muted)', fontSize: '.88rem', marginBottom: '28px' }}>Enter your email and we'll send you a reset link.</p>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '.83rem', fontWeight: 600, marginBottom: '7px', display: 'block' }}>Email Address</label>
                  <input type="email" className="form-input" placeholder="abebe@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleForgotPassword()} />
                </div>
                <button onClick={handleForgotPassword} disabled={loading} style={{ width: '100%', padding: '14px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '.95rem', cursor: 'pointer' }}>
                  {loading ? 'Sending…' : 'Send Reset Link →'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function AuthPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Loading…</div>}>
        <AuthForm />
      </Suspense>
    </>
  );
}
