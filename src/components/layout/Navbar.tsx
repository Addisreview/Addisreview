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

  useEffect(() => {
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link href="/search" style={{
          color: 'rgba(255,255,255,.78)',
          textDecoration: 'none',
          fontSize: '.88rem',
          fontWeight: 500,
          transition: 'color .2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--yellow)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.78)')}
        >
          Explore
        </Link>

        <Link href="/write-review" style={{
          color: 'rgba(255,255,255,.78)',
          textDecoration: 'none',
          fontSize: '.88rem',
          fontWeight: 500,
          transition: 'color .2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--yellow)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.78)')}
        >
          Write a Review
        </Link>

        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'var(--yellow)',
                color: 'var(--charcoal)',
                padding: '8px 18px',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '.85rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {user.email?.split('@')[0]} ▾
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border)',
                minWidth: '160px',
                overflow: 'hidden',
                zIndex: 300,
              }}>
                <button
                  onClick={handleSignOut}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 18px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '.88rem',
                    cursor: 'pointer',
                    color: 'var(--charcoal)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth" style={{
            background: 'var(--yellow)',
            color: 'var(--charcoal)',
            padding: '8px 18px',
            borderRadius: '50px',
            fontWeight: 700,
            fontSize: '.85rem',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'background .2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--yellow-dark)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--yellow)')}
          >
            Sign Up / Log In
          </Link>
        )}
      </div>
    </nav>
  );
}
