export const revalidate = 0;
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface Props {
  params: { slug: string };
}

export default async function BusinessPage({ params }: Props) {
  const supabase = createServerClient();

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single() as any;

  if (!business) notFound();

  // DEBUG QUERY - no filter, raw data
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles:user_id (
        display_name,
        full_name,
        avatar_url
      )
    `)
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <Navbar />
      <div style={{ padding: '40px 5vw', maxWidth: '900px', margin: '0 auto' }}>
        <h1>🔧 DEBUG MODE - {business.name}</h1>
        <p><strong>Business ID:</strong> {business.id}</p>
        <p><strong>Reviews found:</strong> {reviews?.length || 0}</p>

        {error && <p style={{ color: 'red' }}>Query error: {error.message}</p>}

        <pre style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', overflow: 'auto', fontSize: '0.85rem' }}>
          {JSON.stringify(reviews, null, 2)}
        </pre>

        <p style={{ marginTop: '30px' }}>
          <a href={`/business/${params.slug}`} style={{ color: 'var(--green)' }}>
            ← Back to normal business page
          </a>
        </p>
      </div>
      <Footer />
    </>
  );
}
