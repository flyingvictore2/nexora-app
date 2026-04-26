'use client';

import { Suspense, useState, useEffect } from 'react';
import { Loader2 as Spinner, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ContentCard } from '@/components/content/ContentCard';
import { useContent } from '@/hooks/useContent';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const CONTENT_TYPES = [
  { value: '', label: 'Todo' },
  { value: 'MOVIE', label: 'Películas' },
  { value: 'SERIES', label: 'Series' },
  { value: 'ANIME', label: 'Anime' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Más recientes', icon: Clock },
  { value: 'releaseYear', label: 'Año de estreno', icon: Sparkles },
  { value: 'totalViews', label: 'Más vistos', icon: TrendingUp },
];

function isRecentlyAdded(createdAt: string): boolean {
  const diffDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
}

function NewReleasesContent() {
  const [type, setType] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<any[]>([]);

  const params = {
    type: type || undefined,
    sortBy,
    sortOrder: 'desc',
    page,
    limit: 24,
  };

  const { data, isLoading, isFetching } = useContent(params);

  useEffect(() => {
    if (page === 1) {
      setAllItems(data?.content || []);
    } else if (data?.content) {
      setAllItems((prev) => [...prev, ...data.content]);
    }
  }, [data, page]);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setPage(1);
    setAllItems([]);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPage(1);
    setAllItems([]);
  };

  return (
    <div className="min-h-screen bg-nexora-dark">
      <Navbar />

      {/* Hero header */}
      <div className="relative pt-24 pb-12 px-4 md:px-12 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-nexora-red/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-nexora-red/40 to-transparent" />

        <div className="relative max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-7 h-7 text-nexora-red" />
            <span className="text-nexora-red font-semibold text-sm uppercase tracking-widest">
              Recién llegado
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">Novedades</h1>
          <p className="text-gray-400 text-base max-w-lg">
            Descubre los últimos títulos añadidos a la plataforma. Siempre lo más fresco, ordenado por fecha de incorporación.
          </p>

          {data && (
            <p className="mt-4 text-sm text-gray-500">
              {data.total} título{data.total !== 1 ? 's' : ''} disponibles
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 md:px-12 pb-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-wrap items-center gap-3">
          {/* Type pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {CONTENT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => handleTypeChange(t.value)}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  type === t.value
                    ? 'bg-nexora-red text-white shadow-lg shadow-nexora-red/20'
                    : 'bg-white/10 hover:bg-white/20 text-gray-300',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-white/10 mx-2" />

          {/* Sort options */}
          <div className="flex items-center gap-2 flex-wrap">
            {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleSortChange(value)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200',
                  sortBy === value
                    ? 'bg-white/20 text-white'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/10',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="px-4 md:px-12 pb-20 max-w-screen-2xl mx-auto">
        {isLoading && page === 1 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] skeleton rounded" />
            ))}
          </div>
        ) : allItems.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {allItems.map((item: any) => (
                <div key={item.id} className="relative">
                  {/* "NUEVO" badge for recently added content */}
                  {(item.isNew || isRecentlyAdded(item.createdAt)) && (
                    <div className="absolute top-2 left-2 z-10 bg-nexora-red text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-md">
                      Nuevo
                    </div>
                  )}
                  <ContentCard content={item} size="sm" />
                </div>
              ))}
            </div>

            {/* Load more */}
            {data && page < data.totalPages && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isFetching}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-10 py-3 rounded-full text-sm font-medium transition-colors disabled:opacity-70"
                >
                  {isFetching && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cargar más
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl mb-2">Sin novedades</p>
            <p className="text-gray-500 text-sm">Prueba con otro filtro</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewReleasesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-nexora-dark flex items-center justify-center">
          <Spinner className="w-10 h-10 text-nexora-red animate-spin" />
        </div>
      }
    >
      <NewReleasesContent />
    </Suspense>
  );
}
