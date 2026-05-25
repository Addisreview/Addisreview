'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

export default function MyCollectionPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      if (!currentUser) {
        router.push('/auth?redirect=/collection');
        return;
      }
      setUser(currentUser);
      setLoading(false);
    }
    loadUser();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '120px 20px', textAlign: 'center' }}>Loading your collection...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 5vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <span style={{ fontSize: '2.5rem' }}>⭐</span>
          <h1 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '2.2rem', 
            fontWeight: 900,
            margin: 0 
          }}>
            My Collection
          </h1>
        </div>

        {/* Empty state */}
        <div style={{
          background: '#fff',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          padding: '80px 40px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '6rem', marginBottom: '24px', opacity: 0.3 }}>♡</div>
          <h2 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '1.6rem', 
            marginBottom: '12px' 
          }}>
            Your collection is empty
          </h2>
          <p style={{ 
            color: 'var(--muted)', 
            fontSize: '1.05rem', 
            lineHeight: 1.6,
            maxWidth: '380px',
            margin: '0 auto 32px'
          }}>
            Save your favorite businesses so you can easily find them later.
          </p>
          
          <Link href="/search">
            <button style={{
              background: 'var(--green)',
              color: '#fff',
              border: 'none',
              padding: '16px 36px',
              borderRadius: '50px',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)'
            }}>
              Browse Businesses →
            </button>
          </Link>
        </div>

        <p style={{ 
          textAlign: 'center', 
          color: 'var(--muted)', 
          marginTop: '60px',
          fontSize: '.9rem' 
        }}>
          Saved businesses will appear here
        </p>
      </main>
      <Footer />
    </>
  );
}
