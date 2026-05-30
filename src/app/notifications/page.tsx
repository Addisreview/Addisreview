'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { timeAgo } from '@/lib/utils';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth?redirect=/notifications');
        return;
      }

      const userId = session.user.id;

      const { data } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setNotifications(data || []);

      // Mark all unread as read
      await (supabase as any)
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      setLoading(false);
    }

    load();
  }, []);

  if (loading) return (
    <>
      <Navbar />
      <div style={{ padding: '100px', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 5vw 80px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>
          Notifications
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '32px', fontSize: '.93rem' }}>
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </p>

        {notifications.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#fff', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', color: 'var(--muted)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔔</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '8px' }}>No notifications yet</div>
            <div style={{ fontSize: '.9rem' }}>When someone reacts to your reviews, you'll see it here.</div>
          </div>
        ) : notifications.map(n => (
          <div
            key={n.id}
            style={{
              background: n.is_read ? '#fff' : '#f0faf4',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              borderLeft: n.is_read ? '1px solid var(--border)' : '4px solid var(--green)',
              padding: '18px 20px',
              marginBottom: '12px',
            }}
          >
            <div style={{ fontSize: '.95rem', color: 'var(--charcoal)', marginBottom: '6px' }}>
              {n.message}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{timeAgo(n.created_at)}</span>
              {n.link && (
                <Link href={n.link} style={{ fontSize: '.78rem', color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
                  View →
                </Link>
              )}
            </div>
          </div>
        ))}
      </main>
      <Footer />
    </>
  );
}
