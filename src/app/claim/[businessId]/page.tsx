// src/app/claim/[businessId]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ClaimBusinessClient from './ClaimBusinessClient';

interface Props {
  params: { businessId: string };
}

export default async function ClaimPage({ params }: Props) {
  const supabase = createServerClient();

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, phone, address, category_name')
    .eq('id', params.businessId)
    .eq('is_active', true)
    .single() as any;

  if (!business) notFound();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Navbar />
      <ClaimBusinessClient business={business} user={user} />
      <Footer />
    </>
  );
}
