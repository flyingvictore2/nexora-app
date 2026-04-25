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
