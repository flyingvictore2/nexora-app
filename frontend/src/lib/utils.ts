import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function formatProgress(seconds: number, total: number): string {
  if (!total) return '0%';
  return `${Math.round((seconds / total) * 100)}%`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount);
}

export function getProgressPercent(progress: number, duration: number): number {
  if (!duration) return 0;
  return Math.min(100, Math.round((progress / duration) * 100));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// Known embed/iframe video hosting providers
const EMBED_DOMAINS = [
  'lulustream.com', 'luluvdo.com',
  'voe.sx', 'voe.la',
  'streamtape.com', 'streamtape.net',
  'doodstream.com', 'dood.la', 'dood.to', 'dood.watch',
  'mixdrop.co', 'mixdrop.to', 'mixdrop.ag',
  'vidplay.online', 'vidplay.site',
  'filemoon.sx', 'filemoon.in',
  'mycloud.vip', 'mcloud.to',
  'upstream.to',
  'fembed.com',
  'ok.ru/videoembed',
  'sibnet.ru/shell',
  'mp4upload.com/embed',
  'sendvid.com',
  'vidmoly.to',
  'vtbe.to',
  'fplayer.info',
  'abysscdn.com',
];

/**
 * Detects the correct video source type from a URL.
 * Explicit `hint` takes priority; URL pattern is the fallback.
 */
export function detectVideoType(
  url: string,
  hint?: string,
): 'DIRECT' | 'EMBED' | 'HLS' {
  if (!url) return 'DIRECT';
  if (hint === 'EMBED') return 'EMBED';
  if (hint === 'HLS') return 'HLS';

  const lower = url.toLowerCase();

  // HLS
  if (lower.includes('.m3u8') || lower.includes('m3u8') || lower.includes('/hls/')) return 'HLS';

  // Embed providers
  if (EMBED_DOMAINS.some((d) => lower.includes(d))) return 'EMBED';

  // Generic embed patterns: /e/, /embed/, /player/
  if (/\/(e|embed|player|v|video)\/[a-z0-9]/i.test(url) && !lower.endsWith('.mp4') && !lower.endsWith('.webm')) {
    // Extra check: not a CDN direct file
    if (!lower.match(/\.(mp4|webm|ogg|avi|mov)(\?|$)/)) return 'EMBED';
  }

  if (hint === 'DIRECT') return 'DIRECT';
  return 'DIRECT';
}

export function getMaturityColor(rating: string): string {
  const colors: Record<string, string> = {
    'G': 'bg-green-600',
    'PG': 'bg-yellow-600',
    'PG-13': 'bg-orange-600',
    'R': 'bg-red-600',
    'NC-17': 'bg-red-800',
    'TV-Y': 'bg-green-600',
    'TV-PG': 'bg-yellow-600',
    'TV-14': 'bg-orange-600',
    'TV-MA': 'bg-red-600',
    'ALL': 'bg-blue-600',
  };
  return colors[rating] || 'bg-gray-600';
}
