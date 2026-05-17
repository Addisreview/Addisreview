import { createServerClient } from '@/lib/supabase';

export default async function sitemap() {
  const supabase = createServerClient();
  const baseUrl = 'https://addisreview.co';

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/write-review`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/auth`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Business pages
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, updated_at')
    .eq('is_active', true)
    .not('slug', 'is', null) as any;

  const businessPages = (businesses || []).map((biz: any) => ({
    url: `${baseUrl}/business/${biz.slug}`,
    lastModified: new Date(biz.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...businessPages];
}
