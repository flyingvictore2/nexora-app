'use client';

import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { ContentCard } from '@/components/content/ContentCard';
import { ArrowLeft, List, Loader2 } from 'lucide-react';
import { useList } from '@/hooks/useLists';
import Link from 'next/link';

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: list, isLoading } = useList(id);

  return (
    <div className="min-h-screen bg-nexora-dark">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-16 max-w-7xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.push('/my-list')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Mi Lista
        </button>

        {isLoading ? (
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 skeleton rounded" />
            <div className="w-48 h-7 skeleton rounded" />
          </div>
        ) : list ? (
          <>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{list.emoji}</span>
              <h1 className="text-3xl font-bold">{list.name}</h1>
            </div>
            <p className="text-gray-400 text-sm mb-8">
              {list._count?.items ?? list.items?.length ?? 0} título{(list._count?.items ?? list.items?.length ?? 0) !== 1 ? 's' : ''}
            </p>

            {list.items?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <List className="w-16 h-16 text-gray-600 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Lista vacía</h2>
                <p className="text-gray-400 mb-6">Añade contenido desde el catálogo</p>
                <Link
                  href="/browse"
                  className="bg-nexora-red hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Explorar catálogo
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {list.items.map((item: any) => (
                  <ContentCard key={item.id} content={item.content} size="sm" />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32 text-gray-400">Lista no encontrada</div>
        )}
      </div>
    </div>
  );
}
