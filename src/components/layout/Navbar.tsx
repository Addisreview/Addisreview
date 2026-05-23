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
  const [menuOpen, setMenuOpen] = useState(false);
  const [bizMenuOpen, setBizMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileBizOpen, setMobileBizOpen] = useState(false);
  const bizRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          setUser(data.session.user);
          window.history.replaceState(null, '', window.location.pathname);
          router.refresh();
        }
      });
    }

    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
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
    router.push('/');
    router.refresh();
  };

  // If not logged in, redirect to auth with context
  const handleWriteReview = () => {
    if (user) {
      router.push('/write-review');
    } else {
      router.push('/auth?redirect=/write-review&reason=review');
    }
  };

  const menuItemStyle: React.CSSProperties = {
    display: 'block', width: '100%', textAlign: 'left',
    padding: '11px 16px', background: 'none', border: 'none',
    fontSize: '.88rem', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'var(--font-sans)', color: 'var(--charcoal)',
    whiteSpace: 'nowrap', transition: 'background .12s',
  };

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

          {/* Write a Review — requires login */}
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
                <Link href="/auth?redirect=/auth&reason=add" style={{ textDecoration: 'none' }}>
                  <button style={menuItemStyle} onClick={() => setBizMenuOpen(false)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    Add a Business
                  </button>
                </Link>
                <Link href={user ? '/search' : '/auth?redirect=/search&reason=claim'} style={{ textDecoration: 'none' }}>
                  <button style={menuItemStyle} onClick={() => setBizMenuOpen(false)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    Claim Your Business for Free
                  </button>
                </Link>
                <Link href={user ? '/dashboard' : '/auth?redirect=/dashboard&reason=dashboard'} style={{ textDecoration: 'none' }}>
                  <button style={menuItemStyle} onClick={() => setBizMenuOpen(false)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    Log into Business Account
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* User account */}
          {user ? (
            <div ref={userRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: 'var(--yellow)', color: 'var(--charcoal)',
                  padding: '8px 18px', borderRadius: '50px',
                  fontWeight: 700, fontSize: '.85rem', border: 'none', cursor: 'pointer',
                }}
              >
                {user.email?.split('@')[0]} ▾
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%',
                  background: '#fff', borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                  minWidth: '160px', overflow: 'hidden', zIndex: 300,
                }}>
                  <Link href="/profile" style={{ textDecoration: 'none' }}>
                    <button className="nav-menu-item" onClick={() => setMenuOpen(false)}>👤 My Profile</button>
                  </Link>
                  <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                    <button className="nav-menu-item" onClick={() => setMenuOpen(false)}>🏢 My Business</button>
                  </Link>
                  <button onClick={handleSignOut} className="nav-menu-item">Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" className="btn-nav">Sign Up / Log In</Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-menu-btn"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'none', flexDirection: 'column', gap: '5px', padding: '4px',
          }}
          aria-label="Menu"
        >
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#fff', transition: 'all .2s', transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#fff', transition: 'all .2s', opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#fff', transition: 'all .2s', transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 199,
          background: 'var(--green)', borderTop: '1px solid rgba(255,255,255,.1)',
          padding: '16px 5vw 24px', display: 'flex', flexDirection: 'column', gap: '4px',
          boxShadow: '0 8px 32px rgba(0,0,0,.3)',
        }}>
          <Link href="/search" className="nav-link" onClick={() => setMobileOpen(false)}
            style={{ display: 'block', padding: '12px 0', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
            Explore
          </Link>
          <button
            onClick={() => { setMobileOpen(false); handleWriteReview(); }}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,.85)',
              padding: '12px 0', fontSize: '1rem', cursor: 'pointer',
              textAlign: 'left', fontFamily: 'var(--font-sans)', fontWeight: 400,
              borderBottom: '1px solid rgba(255,255,255,.1)',
            }}
          >
            Write a Review
          </button>

          {/* Mobile Business Owner */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,.1)' }}>
            <button
              onClick={() => setMobileBizOpen(!mobileBizOpen)}
              style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,.85)',
                padding: '12px 0', fontSize: '1rem', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'var(--font-sans)', fontWeight: 600,
                width: '100%', display: 'flex', justifyContent: 'space-between',
              }}
            >
              Business Owner {mobileBizOpen ? '▴' : '▾'}
            </button>
            {mobileBizOpen && (
              <div style={{ paddingBottom: '8px', paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Link href={user ? '/auth' : '/auth?reason=add'} onClick={() => setMobileOpen(false)}
                  style={{ color: 'rgba(255,255,255,.75)', textDecoration: 'none', fontSize: '.9rem', padding: '6px 0', display: 'block' }}>
                  Add a Business
                </Link>
                <Link href={user ? '/search' : '/auth?redirect=/search&reason=claim'} onClick={() => setMobileOpen(false)}
                  style={{ color: 'rgba(255,255,255,.75)', textDecoration: 'none', fontSize: '.9rem', padding: '6px 0', display: 'block' }}>
                  Claim Your Business for Free
                </Link>
                <Link href={user ? '/dashboard' : '/auth?redirect=/dashboard&reason=dashboard'} onClick={() => setMobileOpen(false)}
                  style={{ color: 'rgba(255,255,255,.75)', textDecoration: 'none', fontSize: '.9rem', padding: '6px 0', display: 'block' }}>
                  Log into Business Account
                </Link>
              </div>
            )}
          </div>

          {user ? (
            <>
              <Link href="/profile" className="nav-link" onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '12px 0', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                👤 My Profile
              </Link>
              <Link href="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '12px 0', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                🏢 My Business
              </Link>
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false); }}
                style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,.8)',
                  padding: '12px 0', fontSize: '1rem', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'var(--font-sans)',
                }}
              >
                Sign Out ({user.email?.split('@')[0]})
              </button>
            </>
          ) : (
            <Link href="/auth" onClick={() => setMobileOpen(false)} style={{ display: 'block', marginTop: '8px' }}>
              <button style={{
                background: 'var(--yellow)', color: 'var(--charcoal)',
                border: 'none', borderRadius: '50px', padding: '12px 24px',
                fontWeight: 700, fontSize: '.95rem', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', width: '100%',
              }}>
                Sign Up / Log In
              </button>
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
