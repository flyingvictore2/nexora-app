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

export function HomeClient() {
  const { isAuthenticated } = useAuthStore();

  const { data: featured = [], isLoading: featuredLoading } = useFeaturedContent();
  const { data: trending } = useTrendingContent();
  const { data: newReleases } = useNewReleases();
  const { data: continueWatching } = useContinueWatching();
  const { data: recommendations } = useRecommendations();
  const { data: moviesPage } = useContent({ type: 'MOVIE', limit: 20, sortBy: 'totalViews', sortOrder: 'desc' });
  const { data: seriesPage } = useContent({ type: 'SERIES', limit: 20 });
  const { data: animePage } = useContent({ type: 'ANIME', limit: 20 });
  const { data: actionPage } = useContent({ genre: 'Acción', limit: 20 });

  const continueItems = continueWatching?.map((h: any) => ({
    ...h.content,
    watchHistory: [h],
    _progressPercent: h.duration > 0 ? Math.round((h.progress / h.duration) * 100) : 0,
  }));

  return (
    <div>
      {/* Hero */}
      {featured.length > 0 && (
        <HeroBanner items={featured} />
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

        {/* Recommendations */}
        {isAuthenticated && recommendations && recommendations.length > 0 && (
          <ContentRow title="Recomendado para ti" items={recommendations} />
        )}

        {/* Trending */}
        <ContentRow
          title="Tendencias"
          items={trending || []}
          isLoading={!trending}
        />

        {/* New releases */}
        <ContentRow title="Novedades" items={newReleases || []} />

        {/* Movies */}
        <ContentRow title="Películas populares" items={moviesPage?.content || []} />

        {/* Series */}
        <ContentRow title="Series más vistas" items={seriesPage?.content || []} />

        {/* Anime */}
        <ContentRow title="Anime destacado" items={animePage?.content || []} />

        {/* By genre */}
        <ContentRow title="Acción y Aventura" items={actionPage?.content || []} />
      </div>
    </div>
  );
}
