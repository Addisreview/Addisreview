import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BusinessProfileClient from './BusinessProfileClient';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  const supabase = createServerClient();
  const { data: biz } = await supabase
    .from('businesses')
    .select('name, description, city_name')
    .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
    .single();

  if (!biz) return { title: 'Business Not Found' };

  return {
    title: `${biz.name} — ${biz.city_name}`,
    description: biz.description || `Review and details for ${biz.name} in ${biz.city_name}, Ethiopia.`,
  };
}

export default async function BusinessPage({ params }: Props) {
  const supabase = createServerClient();

  // Fetch business by slug or ID
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
    .eq('is_active', true)
    .single();

  if (!business) notFound();

  // Fetch reviews with author profiles
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(display_name, avatar_url)')
    .eq('business_id', business.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <>
      <Navbar />
      <BusinessProfileClient business={business} reviews={reviews || []} />
      <Footer />
    </>
  );
}
