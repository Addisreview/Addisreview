import { createServerSupabaseClient } from '@/lib/supabase'
import HomeClient from './HomeClient'

export const revalidate = 3600

export default async function HomePage() {
  const supabase = createServerSupabaseClient()

  const [
    { data: topPicks },
    { data: categories },
    { data: cities },
    { data: featuredBusinesses },
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, name, slug, category_name, city_name, neighborhood, address, rating_avg, review_count, price_range, is_featured, google_rating, hours, features')
      .eq('is_active', true)
      .gte('google_rating', 4.0)
      .order('google_rating', { ascending: false })
      .order('review_count', { ascending: false })
      .limit(12),

    supabase
      .from('categories')
      .select('id, name, slug, icon, business_count')
      .order('business_count', { ascending: false })
      .limit(10),

    supabase
      .from('cities')
      .select('id, name, slug, place_count')
      .order('place_count', { ascending: false }),

    supabase
      .from('businesses')
      .select('id, name, slug, category_name, city_name, neighborhood, rating_avg, review_count, price_range, google_rating, hours, features')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('google_rating', { ascending: false })
      .limit(6),
  ])

  return (
    <HomeClient
      topPicks={topPicks || []}
      categories={categories || []}
      cities={cities || []}
      featuredBusinesses={featuredBusinesses || []}
    />
  )
}
