export const revalidate = 0;
import { createServerClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const supabase = createServerClient();

  const { data: featured } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('google_rating', { ascending: false })
    .limit(12) as any;

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
        businesses={featured || []}
        cities={cities || []}
        categories={categories || []}
      />
      <Footer />
    </>
  );
}
