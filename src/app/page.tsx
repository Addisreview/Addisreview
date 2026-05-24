export const revalidate = 0;
import { createServerClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const supabase = createServerClient();

  const { data: topRated } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_active', true)
    .eq('city_name', 'Addis Ababa')
    .gte('google_rating', 4.5)
    .order('google_rating', { ascending: false })
    .order('is_featured', { ascending: false })
    .limit(20) as any;

  // Get live business count for Addis Ababa
  const { count: addisCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('city_name', 'Addis Ababa');

  const { data: citiesRaw } = await supabase
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('place_count', { ascending: false }) as any;

  // Inject the live count into Addis Ababa so it's always accurate
  const cities = (citiesRaw || []).map((city: any) =>
    city.name === 'Addis Ababa'
      ? { ...city, place_count: addisCount ?? city.place_count }
      : city
  );

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, emoji, sort_order')
    .order('sort_order') as any;

  return (
    <>
      <Navbar />
      <HomeClient
        businesses={topRated || []}
        cities={cities}
        categories={categories || []}
      />
      <Footer />
    </>
  );
}
