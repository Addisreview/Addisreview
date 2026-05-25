'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { User } from '@supabase/supabase-js';

export default function AccountSettingsPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('profile'); // default tab
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      if (!currentUser) {
        router.push('/auth?redirect=/account/settings');
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
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 5vw', minHeight: '70vh' }}>
          <div style={{ display: 'flex', gap: '40px' }}>
            {/* Sidebar skeleton */}
            <div style={{ width: '260px', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '20px' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ height: '48px', background: '#f0ebe3', marginBottom: '8px', borderRadius: '8px' }} />
              ))}
            </div>
            {/* Main content skeleton */}
            <div style={{ flex: 1, background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '40px' }}>
              <div style={{ height: '40px', background: '#f0ebe3', marginBottom: '30px', borderRadius: '8px', width: '200px' }} />
              <div style={{ height: '300px', background: '#f0ebe3', borderRadius: '12px' }} />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'password', label: 'Password', icon: '🔑' },
    { id: 'email', label: 'Email / Notifications', icon: '✉️' },
    { id: 'locations', label: 'Locations', icon: '📍' },
    { id: 'friends', label: 'Friends', icon: '👥' },
    { id: 'privacy', label: 'Privacy Settings', icon: '🔒' },
    { id: 'external', label: 'External Applications', icon: '🔗' },
    { id: 'security', label: 'Security Settings', icon: '🛡️' },
  ];

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 5vw', minHeight: '70vh' }}>
        <div style={{ display: 'flex', gap: '40px' }}>
          {/* LEFT SIDEBAR - Yelp style */}
          <div style={{
            width: '260px',
            background: '#fff',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: '12px 0',
            height: 'fit-content',
            position: 'sticky',
            top: '100px',
          }}>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 24px',
                  background: activeTab === item.id ? 'var(--green)' : 'transparent',
                  color: activeTab === item.id ? '#fff' : 'var(--charcoal)',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: activeTab === item.id ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* MAIN CONTENT AREA */}
          <div style={{
            flex: 1,
            background: '#fff',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: '40px',
            minHeight: '600px',
          }}>
            {activeTab === 'profile' && (
              <div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>
                  Profile
                </h1>
                <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>
                  Update your personal information
                </p>

                {/* Profile photo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100px', height: '100px', borderRadius: '50%',
                      background: 'var(--green)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2.5rem', fontWeight: 700,
                    }}>
                      {initial}
                    </div>
                  )}
                  <div>
                    <button style={{ background: 'var(--yellow)', color: 'var(--charcoal)', border: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: 600, cursor: 'pointer' }}>
                      Add / Edit Photo
                    </button>
                    <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '8px' }}>
                      Recommended: Square JPG or PNG, at least 400×400px
                    </p>
                  </div>
                </div>

                {/* Form fields (Yelp style) */}
                <div style={{ maxWidth: '420px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.user_metadata?.full_name?.split(' ')[0] || ''}
                      style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || ''}
                      style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      Nickname (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="The Boss, Calamity Jane, The Prolific Reviewer"
                      style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '8px' }}>
                      Gender
                    </label>
                    <div style={{ display: 'flex', gap: '24px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="gender" /> Female
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="gender" /> Male
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="gender" defaultChecked /> Other
                      </label>
                    </div>
                  </div>

                  <button style={{
                    background: 'var(--green)', color: '#fff', border: 'none',
                    padding: '14px 32px', borderRadius: '50px', fontSize: '1.1rem',
                    fontWeight: 700, cursor: 'pointer', width: '100%',
                  }}>
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== 'profile' && (
              <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚧</div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{sidebarItems.find(i => i.id === activeTab)?.label} is coming soon</h2>
                <p>We’ll add this section next. Let me know which tab you want to build first!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
