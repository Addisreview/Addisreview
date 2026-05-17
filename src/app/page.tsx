import { createServerClient } from '@/lib/supabase'
import HomeClient from './HomeClient'

export const revalidate = 3600

export default async function HomePage() {
  const supabase = createServerClient()

  const [
    { data: businesses },
    { data: categories },
    { data: cities },
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
      .select('id, name, slug, place_count, emoji')
      .order('place_count', { ascending: false }),
  ])

  return (
    <HomeClient
      businesses={businesses || []}
      categories={categories || []}
      cities={cities || []}
    />
  )
}
