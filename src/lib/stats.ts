import { createServerClient } from '@/lib/supabase';

export async function getBusinessCount(): Promise<string> {
  try {
    const supabase = createServerClient();
    const { count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    if (!count) return '8,500+';
    // Round down to nearest 100 and add +
    const rounded = Math.floor(count / 100) * 100;
    return `${rounded.toLocaleString()}+`;
  } catch {
    return '8,500+';
  }
}
