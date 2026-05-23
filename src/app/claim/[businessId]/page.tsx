// src/app/claim/[businessId]/page.tsx
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ClaimAuthGuard from './ClaimAuthGuard';
import Link from 'next/link';

interface Props {
  params: { businessId: string };
}

export default async function ClaimPage({ params }: Props) {
  const supabase = createServerClient();

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, phone, address, category_name, is_claimed')
    .eq('id', params.businessId)
    .eq('is_active', true)
    .single() as any;

  if (!business) notFound();

  // If already claimed, show message
  if (business.is_claimed) {
    return (
      <>
        <Navbar />
        <main style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 5vw', textAlign: 'center', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🏢</div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.8rem', fontWeight: 900, marginBottom: '12px' }}>
            This business is already claimed
          </h1>
          <p style={{ color: '#6b6b6b', lineHeight: 1.7, marginBottom: '32px' }}>
            <strong>{business.name}</strong> has already been claimed and verified by its owner on AddisReview.
          </p>
          <p style={{ color: '#6b6b6b', fontSize: '.88rem', lineHeight: 1.7, marginBottom: '32px' }}>
            If you believe this is a mistake or you are the rightful owner, please contact us at{' '}
            <a href="mailto:hello@addisreviews.com" style={{ color: '#1a5c3a', fontWeight: 600 }}>hello@addisreviews.com</a>
          </p>
          <Link href={`/business/${business.slug}`}>
            <button style={{ background: '#1a5c3a', color: '#fff', border: 'none', borderRadius: '50px', padding: '13px 28px', fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 700, fontSize: '.95rem', cursor: 'pointer' }}>
              View Business Page →
            </button>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ClaimAuthGuard businessId={params.businessId} business={business} />
      <Footer />
    </>
  );
}
