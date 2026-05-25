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
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state for Profile tab
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      if (!currentUser) {
        router.push('/auth?redirect=/account/settings');
        return;
      }
      setUser(currentUser);

      // Pre-fill form from existing data
      const metadata = currentUser.user_metadata || {};
      const fullName = metadata.full_name || '';
      const nameParts = fullName.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setNickname(metadata.nickname || '');
      setGender(''); // gender comes from profiles table - we can fetch later if needed

      setLoading(false);
    }
    loadUser();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);

    const res = await fetch('/api/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        firstName,
        lastName,
        nickname,
        gender,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Refresh user session so navbar shows new name
      await supabase.auth.refreshSession();
    } else {
      setMessage({ type: 'error', text: data.error || 'Failed to save' });
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      form.reset();
    }
    setSaving(false);
  };

  if (loading) {
    return <div>Loading...</div>; // you already have skeleton, this is fine for now
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
          {/* Sidebar */}
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
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div style={{
            flex: 1,
            background: '#fff',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: '40px',
          }}>
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>Profile</h1>
                <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>Update your personal information</p>

                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100px', height: '100px', borderRadius: '50%',
                      background: '#f57c00', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2.5rem', fontWeight: 700,
                    }}>
                      {initial}
                    </div>
                  )}
                  <div>
                    <button type="button" style={{ background: 'var(--yellow)', color: 'var(--charcoal)', border: 'none', padding: '10px 24px', borderRadius: '50px', fontWeight: 600 }}>
                      Add / Edit Photo
                    </button>
                    <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '8px' }}>
                      Recommended: Square JPG or PNG, at least 400×400px
                    </p>
                  </div>
                </div>

                <div style={{ maxWidth: '420px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '6px' }}>First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '6px' }}>Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '6px' }}>Nickname (optional)</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="The Boss, Calamity Jane..."
                      style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '8px' }}>Gender</label>
                    <div style={{ display: 'flex', gap: '24px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="gender" checked={gender === 'Female'} onChange={() => setGender('Female')} /> Female
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="gender" checked={gender === 'Male'} onChange={() => setGender('Male')} /> Male
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="gender" checked={gender === 'Other'} onChange={() => setGender('Other')} /> Other
                      </label>
                    </div>
                  </div>

                  {message && (
                    <div style={{ padding: '12px', background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', borderRadius: '8px', marginBottom: '20px' }}>
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      background: 'var(--green)',
                      color: '#fff',
                      border: 'none',
                      padding: '14px 32px',
                      borderRadius: '50px',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>Password</h1>
                <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>Change your password</p>

                <div style={{ maxWidth: '420px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '6px' }}>Current Password</label>
                    <input name="currentPassword" type="password" required style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '6px' }}>New Password</label>
                    <input name="newPassword" type="password" required style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>

                  <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '6px' }}>Confirm New Password</label>
                    <input name="confirmPassword" type="password" required style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>

                  {message && (
                    <div style={{ padding: '12px', background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', borderRadius: '8px', marginBottom: '20px' }}>
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      background: 'var(--green)',
                      color: '#fff',
                      border: 'none',
                      padding: '14px 32px',
                      borderRadius: '50px',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}

            {activeTab !== 'profile' && activeTab !== 'password' && (
              <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚧</div>
                <h2>{sidebarItems.find(i => i.id === activeTab)?.label} is coming soon</h2>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
