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
  const [displayName, setDisplayName] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [bizMenuOpen, setBizMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileBizOpen, setMobileBizOpen] = useState(false);
  const bizRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  async function loadAvatar(userId: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('avatar_url, display_name')
      .eq('id', userId)
      .single() as any;
    if (error) {
      console.error('Failed to load profile:', error);
      return;
    }
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
    if (profile?.display_name) setDisplayName(profile.display_name);
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
    setMobileOpen(false);
    router.push('/');
    router.refresh();
  };

  const handleWriteReview = () => {
    setMobileOpen(false);
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

  const resolvedDisplayName = displayName || user?.email?.split('@')[0] || 'User';

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
                  <img src={avatarUrl} alt={resolvedDisplayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span style={{ fontSize: '1.1rem' }}>{resolvedDisplayName.charAt(0).toUpperCase()}</span>
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

        {/* Mobile hamburger button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            background: 'none', border: 'none', cursor: 'pointer',
            flexDirection: 'column', gap: '5px', padding: '8px',
          }}
        >
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#fff', borderRadius: '2px',
            transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none', transition: 'transform .2s' }} />
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#fff', borderRadius: '2px',
            opacity: mobileOpen ? 0 : 1, transition: 'opacity .2s' }} />
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#fff', borderRadius: '2px',
            transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none', transition: 'transform .2s' }} />
        </button>
      </nav>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0,
          background: '#fff', zIndex: 199, overflowY: 'auto',
          borderTop: '1px solid var(--border)',
        }}>
          {/* User info at top if logged in */}
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '20px', borderBottom: '1px solid var(--border)',
              background: 'var(--cream)',
            }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={resolvedDisplayName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'var(--yellow)', color: 'var(--charcoal)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', fontWeight: 700,
                }}>
                  {resolvedDisplayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{resolvedDisplayName}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{user.email}</div>
              </div>
            </div>
          )}

          {/* Main links */}
          <div style={{ padding: '12px 0' }}>
            <Link href="/search" style={{ textDecoration: 'none' }}>
              <button onClick={() => setMobileOpen(false)} style={{
                ...menuItemStyle, fontSize: '1rem', padding: '16px 24px',
                borderBottom: '1px solid var(--border)', width: '100%',
              }}>
                🔍 Explore
              </button>
            </Link>

            <button onClick={handleWriteReview} style={{
              ...menuItemStyle, fontSize: '1rem', padding: '16px 24px',
              borderBottom: '1px solid var(--border)', width: '100%',
            }}>
              ✏️ Write a Review
            </button>

            {/* Business Owner section */}
            <button
              onClick={() => setMobileBizOpen(!mobileBizOpen)}
              style={{
                ...menuItemStyle, fontSize: '1rem', padding: '16px 24px',
                borderBottom: '1px solid var(--border)', width: '100%',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <span>🏢 Business Owner</span>
              <span>{mobileBizOpen ? '▴' : '▾'}</span>
            </button>

            {mobileBizOpen && (
              <div style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border)' }}>
                <Link href={user ? '/add-business' : '/auth?redirect=/add-business&reason=add'} style={{ textDecoration: 'none' }}>
                  <button onClick={() => setMobileOpen(false)} style={{
                    ...menuItemStyle, padding: '14px 36px', width: '100%',
                  }}>Add a Business</button>
                </Link>
                <Link href={user ? '/search' : '/auth?redirect=/search&reason=claim'} style={{ textDecoration: 'none' }}>
                  <button onClick={() => setMobileOpen(false)} style={{
                    ...menuItemStyle, padding: '14px 36px', width: '100%',
                  }}>Claim Your Business for Free</button>
                </Link>
                <Link href={user ? '/dashboard' : '/auth?redirect=/dashboard&reason=dashboard'} style={{ textDecoration: 'none' }}>
                  <button onClick={() => setMobileOpen(false)} style={{
                    ...menuItemStyle, padding: '14px 36px', width: '100%',
                  }}>Log into Business Account</button>
                </Link>
              </div>
            )}

            {/* User links if logged in */}
            {user ? (
              <>
                <Link href="/profile" style={{ textDecoration: 'none' }}>
                  <button onClick={() => setMobileOpen(false)} style={{
                    ...menuItemStyle, fontSize: '1rem', padding: '16px 24px',
                    borderBottom: '1px solid var(--border)', width: '100%',
                  }}>👤 My Profile</button>
                </Link>
                <Link href="/collection" style={{ textDecoration: 'none' }}>
                  <button onClick={() => setMobileOpen(false)} style={{
                    ...menuItemStyle, fontSize: '1rem', padding: '16px 24px',
                    borderBottom: '1px solid var(--border)', width: '100%',
                  }}>⭐ My Collection</button>
                </Link>
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                  <button onClick={() => setMobileOpen(false)} style={{
                    ...menuItemStyle, fontSize: '1rem', padding: '16px 24px',
                    borderBottom: '1px solid var(--border)', width: '100%',
                  }}>🏢 My Business</button>
                </Link>
                <Link href="/account/settings" style={{ textDecoration: 'none' }}>
                  <button onClick={() => setMobileOpen(false)} style={{
                    ...menuItemStyle, fontSize: '1rem', padding: '16px 24px',
                    borderBottom: '1px solid var(--border)', width: '100%',
                  }}>⚙️ Account Settings</button>
                </Link>
                <button onClick={handleSignOut} style={{
                  ...menuItemStyle, fontSize: '1rem', padding: '16px 24px',
                  color: 'var(--red)', width: '100%',
                }}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth" style={{ textDecoration: 'none' }}>
                <button onClick={() => setMobileOpen(false)} style={{
                  ...menuItemStyle, fontSize: '1rem', padding: '16px 24px',
                  fontWeight: 700, color: 'var(--green)', width: '100%',
                }}>
                  Sign Up / Log In
                </button>
              </Link>
            )}
          </div>
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
