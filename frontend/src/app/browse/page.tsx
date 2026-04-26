'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 as Spinner } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ContentCard } from '@/components/content/ContentCard';
import { useContent, useGenres } from '@/hooks/useContent';
import { Search, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const CONTENT_TYPES = [
  { value: '', label: 'Todo' },
  { value: 'MOVIE', label: 'Películas' },
  { value: 'SERIES', label: 'Series' },
  { value: 'ANIME', label: 'Anime' },
];

const SORT_OPTIONS = [
  { value: 'totalViews', label: 'Más vistos' },
  { value: 'createdAt', label: 'Más recientes' },
  { value: 'averageRating', label: 'Mejor valorados' },
  { value: 'releaseYear', label: 'Año' },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [sortBy, setSortBy] = useState('totalViews');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [allItems, setAllItems] = useState<any[]>([]);

  const { data: genresData } = useGenres();

  // Sync filters when URL params change (e.g. navbar links: Series, Películas, Anime)
  useEffect(() => {
    setType(searchParams.get('type') || '');
    setSearch(searchParams.get('search') || '');
    setGenre(searchParams.get('genre') || '');
    setPage(1);
    setAllItems([]);
  }, [searchParams]);

  const params = {
    search: search || undefined,
    type: type || undefined,
    genre: genre || undefined,
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

  const handleFilterChange = () => {
    setPage(1);
    setAllItems([]);
  };

  return (
    <div className="min-h-screen bg-nexora-dark">
      <Navbar />

      <div className="pt-24 px-4 md:px-12 pb-16">
        <h1 className="text-3xl font-bold mb-6">Explorar</h1>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
              placeholder="Buscar películas, series, anime..."
              className="w-full bg-nexora-dark-3 border border-white/20 rounded-full pl-12 pr-4 py-3 text-sm focus:border-white/40 transition-colors"
            />
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-2 md:gap-4">
            {/* Content type */}
            {CONTENT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setType(t.value); handleFilterChange(); }}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  type === t.value ? 'bg-nexora-red text-white' : 'bg-white/10 hover:bg-white/20',
                )}
              >
                {t.label}
              </button>
            ))}

            {/* Genre select */}
            <select
              value={genre}
              onChange={(e) => { setGenre(e.target.value); handleFilterChange(); }}
              className="bg-nexora-dark-3 border border-white/20 text-sm px-4 py-2 rounded-full focus:border-white/40"
            >
              <option value="">Todos los géneros</option>
              {genresData?.map((g: string) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); handleFilterChange(); }}
              className="bg-nexora-dark-3 border border-white/20 text-sm px-4 py-2 rounded-full focus:border-white/40"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        {data && (
          <p className="text-gray-400 text-sm mb-6">
            {data.total} resultado{data.total !== 1 ? 's' : ''}
          </p>
        )}

        {/* Grid */}
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
                <ContentCard key={item.id} content={item} size="sm" />
              ))}
            </div>

            {/* Load more */}
            {data && page < data.totalPages && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isFetching}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-8 py-3 rounded-full transition-colors disabled:opacity-70"
                >
                  {isFetching && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cargar más
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-2">Sin resultados</p>
            <p className="text-gray-500 text-sm">Prueba otros filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-nexora-dark flex items-center justify-center"><Spinner className="w-10 h-10 text-nexora-red animate-spin" /></div>}>
      <BrowseContent />
    </Suspense>
  );
}
