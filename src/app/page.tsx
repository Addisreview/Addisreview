export const revalidate = 0;
import { createServerClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const supabase = createServerClient();

  // Top 20: min 4.5 google rating, sorted by rating desc
  // review_count is AddisReview reviews (most are 0 since site is new)
  // google_review_count column doesn't exist in schema, so filter on rating only
  const { data: topRated } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_active', true)
    .eq('city_name', 'Addis Ababa')
    .gte('google_rating', 4.5)
    .order('google_rating', { ascending: false })
    .order('is_featured', { ascending: false })
    .limit(20) as any;

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
