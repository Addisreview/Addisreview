export const revalidate = 0;
import { createServerClient } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SearchClient from './SearchClient';

interface Props {
  searchParams: { q?: string; city?: string; category?: string; rating?: string; sort?: string; page?: string; neighborhood?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const supabase = createServerClient();
  const page = Number(searchParams.page) || 1;

  const { data: results } = await (supabase as any).rpc('search_businesses', {
    search_query: searchParams.q || null,
    city_filter: searchParams.city || null,
    cat_filter: searchParams.category || null,
    min_rating: searchParams.rating ? Number(searchParams.rating) : 0,
    sort_by: searchParams.sort || 'rating',
    page_num: page,
    page_size: 10,
    neighborhood_filter: searchParams.neighborhood || null,
  });

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, emoji, sort_order')
    .order('sort_order') as any;

  const { data: cities } = await supabase
    .from('cities')
    .select('id, name, emoji')
    .eq('is_active', true) as any;

  const businesses = results || [];
  const total = businesses[0]?.total_count ?? 0;

  return (
    <>
      <Navbar />
      <SearchClient
        businesses={businesses}
        totalCount={Number(total)}
        categories={categories || []}
        cities={cities || []}
        currentFilters={searchParams}
        currentPage={page}
      />
      <Footer />
    </>
  );
}
