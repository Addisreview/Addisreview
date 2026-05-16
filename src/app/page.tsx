import { createServerClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const supabase = createServerClient();

  // Fetch featured businesses
  const { data: featured } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('rating_avg', { ascending: false })
    .limit(6);

  // Fetch cities
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('place_count', { ascending: false });

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

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
