export const revalidate = 0;
import { createServerClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const supabase = createServerClient();

  // Show top-rated active businesses (all 2,460+), not just featured
  const { data: topRated } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_active', true)
    .not('google_rating', 'is', null)
    .order('google_rating', { ascending: false })
    .limit(24) as any;

  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('place_count', { ascending: false }) as any;

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, emoji, sort_order')
    .order('sort_order') as any;

  return (
    <>
      <Navbar />
      <HomeClient
        businesses={topRated || []}
        cities={cities || []}
        categories={categories || []}
      />
      <Footer />
    </>
  );
}
