'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Handle implicit OAuth flow — token arrives in URL hash
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          setUser(data.session.user);
          window.history.replaceState(null, '', window.location.pathname);
          router.refresh();
        }
      });
    }

    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <nav style={{
        background: 'var(--green)',
        padding: '0 5vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: '0 2px 20px rgba(0,0,0,.25)',
      }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.8rem',
          fontWeight: 900,
          color: 'var(--yellow)',
          textDecoration: 'none',
          letterSpacing: '-0.5px',
        }}>
          AddisReview<span style={{ color: '#fff', fontStyle: 'italic' }}>.</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }} className="desktop-nav">
          <Link href="/search" className="nav-link">Explore</Link>
          <Link href="/write-review" className="nav-link">Write a Review</Link>
          {user ? (
            <div style={{ position: 'relative' }}>
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

      {/* Mobile menu dropdown */}
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
          <Link href="/write-review" className="nav-link" onClick={() => setMobileOpen(false)}
            style={{ display: 'block', padding: '12px 0', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
            Write a Review
          </Link>
          {user ? (
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
          ) : (
            <Link href="/auth" onClick={() => setMobileOpen(false)}
              style={{ display: 'block', marginTop: '8px' }}>
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
