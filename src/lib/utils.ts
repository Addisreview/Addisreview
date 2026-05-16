import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

export function priceLabel(level: number | null): string {
  if (!level) return '';
  return '$'.repeat(level);
}

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? 's' : ''} ago`;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    'Restaurants': '🍛',
    'Coffee & Buna': '☕',
    'Hotels': '🏨',
    'Spas': '💆',
    'Shopping': '🛍️',
    'Entertainment': '🎵',
    'Healthcare': '🏥',
    'Services': '🔧',
  };
  return map[category] || '📍';
}

export function isOpenNow(hours: Record<string, string> | null): boolean | null {
  if (!hours) return null;
  const now = new Date();
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const todayKey = days[now.getDay()];
  const todayHours = hours[todayKey];
  if (!todayHours || todayHours.toLowerCase() === 'closed') return false;
  if (todayHours.toLowerCase().includes('24')) return true;
  // Simplified: just return true if we have hours (real parsing would be more complex)
  return true;
}
