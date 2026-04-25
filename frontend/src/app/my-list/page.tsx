'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { ContentCard } from '@/components/content/ContentCard';
import { Heart, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function MyListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => (await api.get('/favorites')).data.data,
  });

  const favorites = data?.favorites || [];

  return (
    <div className="min-h-screen bg-nexora-dark">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-7 h-7 text-nexora-red fill-nexora-red" />
          <h1 className="text-3xl font-bold">Mi Lista</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] skeleton rounded" />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <>
            <p className="text-gray-400 text-sm mb-6">{favorites.length} título{favorites.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {favorites.map((fav: any) => (
                <ContentCard key={fav.id} content={fav.content} size="sm" />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Heart className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Tu lista está vacía</h2>
            <p className="text-gray-400 mb-6">Añade películas y series para verlas más tarde</p>
            <Link
              href="/browse"
              className="bg-nexora-red hover:bg-nexora-red-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Explorar catálogo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
