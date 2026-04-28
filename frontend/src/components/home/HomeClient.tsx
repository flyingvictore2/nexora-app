'use client';

import { HeroBanner } from '@/components/content/HeroBanner';
import { ContentRow } from '@/components/content/ContentRow';
import {
  useFeaturedContent,
  useTrendingContent,
  useNewReleases,
  useContinueWatching,
  useRecommendations,
  useContent,
} from '@/hooks/useContent';
import { useAuthStore } from '@/store/auth.store';
import { Baby, Star } from 'lucide-react';

export function HomeClient() {
  const { isAuthenticated, activeProfile } = useAuthStore();
  const isKids = activeProfile?.isKids === true;
  const kidsParam = isKids ? { isKids: true } : {};

  const { data: featured = [], isLoading: featuredLoading } = useFeaturedContent();
  const { data: trending } = useTrendingContent();
  const { data: newReleases } = useNewReleases();
  const { data: continueWatching } = useContinueWatching();
  const { data: recommendations } = useRecommendations();
  const { data: moviesPage } = useContent({ type: 'MOVIE', limit: 20, sortBy: 'totalViews', sortOrder: 'desc', ...kidsParam });
  const { data: seriesPage } = useContent({ type: 'SERIES', limit: 20, ...kidsParam });
  const { data: animePage } = useContent({ type: 'ANIME', limit: 20, ...kidsParam });
  const { data: actionPage } = useContent({ genre: 'Acción', limit: 20, ...kidsParam });
  const { data: kidsPage } = useContent({ isKids: true, limit: 20, sortBy: 'averageRating', sortOrder: 'desc' });

  const continueItems = continueWatching?.map((h: any) => ({
    ...h.content,
    watchHistory: [h],
    _progressPercent: h.duration > 0 ? Math.round((h.progress / h.duration) * 100) : 0,
  }));

  // Filter featured for kids
  const featuredItems = isKids
    ? featured.filter((c: any) => ['ALL', 'G', 'PG', 'TV-G', 'TV-Y', 'TV-Y7', '7+'].includes(c.maturityRating ?? 'ALL'))
    : featured;

  return (
    <div>
      {/* Kids mode banner */}
      {isKids && (
        <div className="fixed top-16 left-0 right-0 z-40 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 via-orange-400 to-pink-500 py-2 text-black font-bold text-sm shadow-lg">
          <Baby className="w-4 h-4" />
          Modo Infantil activado — mostrando contenido para niños
          <Star className="w-4 h-4 fill-black" />
        </div>
      )}

      {/* Hero */}
      {featuredItems.length > 0 && (
        <div className={isKids ? 'mt-8' : ''}>
          <HeroBanner items={featuredItems} />
        </div>
      )}

      {featuredLoading && (
        <div className="h-[85vh] bg-nexora-dark-3 animate-pulse" />
      )}

      <div className="relative z-10 -mt-16">
        {/* Continue watching */}
        {isAuthenticated && continueItems && continueItems.length > 0 && (
          <ContentRow
            title="Seguir viendo"
            items={continueItems}
            showProgress
          />
        )}

        {/* Kids content row */}
        {isKids && (
          <ContentRow
            title="⭐ Para ti"
            items={kidsPage?.content || []}
          />
        )}

        {/* Recommendations — only for non-kids */}
        {isAuthenticated && !isKids && recommendations && recommendations.length > 0 && (
          <ContentRow title="Recomendado para ti" items={recommendations} />
        )}

        {/* Trending */}
        <ContentRow
          title={isKids ? '🌟 Más vistos' : 'Tendencias'}
          items={trending || []}
          isLoading={!trending}
        />

        {/* New releases */}
        {!isKids && <ContentRow title="Novedades" items={newReleases || []} />}

        {/* Movies */}
        <ContentRow title={isKids ? '🎬 Películas para niños' : 'Películas populares'} items={moviesPage?.content || []} />

        {/* Series */}
        <ContentRow title={isKids ? '📺 Series para niños' : 'Series más vistas'} items={seriesPage?.content || []} />

        {/* Anime */}
        <ContentRow title={isKids ? '🎌 Anime para niños' : 'Anime destacado'} items={animePage?.content || []} />

        {/* By genre — only for non-kids */}
        {!isKids && <ContentRow title="Acción y Aventura" items={actionPage?.content || []} />}
      </div>
    </div>
  );
}
