export const revalidate = 0;
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BusinessProfileClient from './BusinessProfileClient';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerClient();
  const { data: biz } = await supabase
    .from('businesses')
    .select('name, description, city_name, category_name, google_rating, review_count, cover_photo_url, neighborhood, address')
    .eq('slug', params.slug)
    .single() as any;

  if (!biz) return { title: 'Business Not Found' };

  const title = `${biz.name} — ${biz.city_name}`;
  const description = biz.description
    ? biz.description.slice(0, 160)
    : `${biz.name} is a ${biz.category_name} in ${biz.neighborhood ? biz.neighborhood + ', ' : ''}${biz.city_name}, Ethiopia. Read reviews and get directions on AddisReview.`;

  return {
    title,
    description,
    keywords: [biz.name, biz.category_name, biz.city_name, 'Ethiopia', 'AddisReview', `${biz.category_name} in ${biz.city_name}`],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_US',
      siteName: 'AddisReview',
      images: biz.cover_photo_url ? [{ url: biz.cover_photo_url, width: 800, height: 600, alt: biz.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: biz.cover_photo_url ? [biz.cover_photo_url] : [],
    },
    alternates: {
      canonical: `https://www.addisreviews.com/business/${params.slug}`,
    },
  };
}

export default async function BusinessPage({ params }: { params: { slug: string } }) {
  const supabase = createServerClient();

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single() as any;

  if (!business) notFound();

  // SIMPLE QUERY - this keeps your review visible
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(display_name, avatar_url)')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(20) as any;

  return (
    <>
      <Navbar />
      <BusinessProfileClient business={business} reviews={reviews || []} />
      <Footer />
    </>
  );
}
