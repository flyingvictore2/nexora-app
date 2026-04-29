'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useContentById, useSimilarContent, useFavoriteToggle, useRateContent } from '@/hooks/useContent';
import { DownloadButton } from '@/components/content/DownloadButton';
import {
  Star, Clock, Globe, Loader2, ArrowLeft,
  MessageSquare, Heart, ExternalLink,
} from 'lucide-react';
import { cn, formatDuration, getMaturityColor } from '@/lib/utils';
import Link from 'next/link';

/* ─── Types ─────────────────────────────────────────────────── */
type Tab = 'links' | 'cast' | 'comments' | 'reviews';

/* ─── Main page ─────────────────────────────────────────────── */
export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('links');
  const [userRating, setUserRating] = useState(0);

  const { data: content, isLoading } = useContentById(id);
  const { data: similar } = useSimilarContent(id);
  const { mutate: toggleFavorite } = useFavoriteToggle();
  const { mutate: rateContent } = useRateContent();

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-nexora-dark flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-nexora-red animate-spin" />
      </div>
    );
  }
  if (!content) {
    return (
      <div className="min-h-screen bg-nexora-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold mb-2">Contenido no encontrado</p>
          <Link href="/" className="text-nexora-red hover:underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'links', label: 'ENLACES' },
    { id: 'cast', label: 'REPARTO' },
    { id: 'comments', label: 'COMENTARIOS' },
    { id: 'reviews', label: 'RESEÑAS' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* ── Header ── */}
      <div className="relative">
        {content.bannerUrl && (
          <div className="absolute inset-0 h-56 overflow-hidden">
            <img src={content.bannerUrl} className="w-full h-full object-cover blur-sm opacity-20 scale-105" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f0f0f]" />
          </div>
        )}

        <div className="relative z-[1] max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              {content.type === 'MOVIE' ? 'Película' : content.type === 'ANIME' ? 'Anime' : 'Serie'}
            </p>
            <h1 className="text-2xl md:text-3xl font-black">{content.title}</h1>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="relative z-[2] max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex gap-6">

          {/* ── Left: Poster + Meta ── */}
          <aside className="hidden md:flex flex-col gap-4 w-44 flex-shrink-0">
            <div className="rounded-xl overflow-hidden shadow-2xl">
              {content.posterUrl
                ? <img src={content.posterUrl} alt={content.title} className="w-full" />
                : <div className="aspect-[2/3] bg-nexora-dark-2 flex items-center justify-center"><span className="text-gray-500 text-xs text-center px-2">{content.title}</span></div>
              }
            </div>

            {/* Rating */}
            <div className="bg-nexora-dark-2 rounded-xl p-3 text-center border border-white/10">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Puntuación</p>
              {content.averageRating > 0 ? (
                <>
                  <p className="text-2xl font-black text-nexora-red">{Math.round(content.averageRating * 20)}%</p>
                  <div className="flex justify-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={cn('w-3 h-3', s <= Math.round(content.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600')} />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{content._count?.ratings ?? 0} votos</p>
                </>
              ) : (
                <p className="text-gray-500 text-sm">Sin votos</p>
              )}
            </div>

            {/* Meta list */}
            <div className="space-y-2 text-xs text-gray-400">
              {content.releaseYear && <div className="flex items-center gap-2"><span className="text-gray-600">📅</span> {content.releaseYear}</div>}
              {content.duration && <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-gray-600" /> {formatDuration(content.duration)}</div>}
              {content.language && <div className="flex items-center gap-2"><Globe className="w-3 h-3 text-gray-600" /> {content.language.toUpperCase()}</div>}
              {content.country && <div className="flex items-center gap-2"><span className="text-gray-600">🌍</span> {content.country}</div>}
              {content.maturityRating && (
                <div>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', getMaturityColor(content.maturityRating))}>
                    {content.maturityRating}
                  </span>
                </div>
              )}
            </div>

            {/* User rating */}
            <div>
              <p className="text-[10px] text-gray-500 uppercase mb-1.5">Tu valoración</p>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onClick={() => { setUserRating(s); rateContent({ contentId: id, rating: s }); }}>
                    <Star className={cn('w-4 h-4 transition-colors', s <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600 hover:text-yellow-300')} />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Center: Content ── */}
          <div className="flex-1 min-w-0">
            {/* Genres */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {content.genres?.map((g: string) => (
                <Link key={g} href={`/browse?genre=${g}`} className="text-xs bg-nexora-red/20 hover:bg-nexora-red/30 text-nexora-red px-2.5 py-0.5 rounded-full transition-colors">
                  {g}
                </Link>
              ))}
              {content.maturityRating && (
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium md:hidden', getMaturityColor(content.maturityRating))}>
                  {content.maturityRating}
                </span>
              )}
            </div>

            {/* Synopsis */}
            <div className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Sinopsis</h2>
              <p className="text-gray-300 text-sm leading-relaxed">{content.description}</p>
            </div>

            {/* Director / Studio */}
            {(content.director || content.studio) && (
              <div className="flex flex-wrap gap-4 text-sm mb-5">
                {content.director && <div><span className="text-gray-500">Director: </span><span className="text-gray-200">{content.director}</span></div>}
                {content.studio && <div><span className="text-gray-500">Estudio: </span><span className="text-gray-200">{content.studio}</span></div>}
              </div>
            )}

            {/* ── Tabs ── */}
            <div className="border-b border-white/10 flex gap-1 mb-4 -mx-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'px-4 py-2.5 text-xs font-bold tracking-widest transition-colors border-b-2 -mb-px',
                    activeTab === t.id
                      ? 'border-nexora-red text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-300',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── ENLACES tab ── */}
            {activeTab === 'links' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => window.open(content.videoUrl, '_blank')}
                    disabled={!content.videoUrl}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-40"
                  >
                    <ExternalLink className="w-4 h-4" /> VER ONLINE EXTERNO
                  </button>
                  <button
                    onClick={() => toggleFavorite(content.id)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    <Heart className="w-4 h-4" /> MI LISTA
                  </button>
                  {content.type === 'MOVIE' && (
                    <DownloadButton
                      contentId={id}
                      title={content.title}
                      posterUrl={content.posterUrl}
                      type={content.type}
                      duration={content.duration}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-2.5 rounded-lg text-sm"
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── REPARTO tab ── */}
            {activeTab === 'cast' && (
              <div className="space-y-3">
                {content.director && (
                  <div className="flex items-center gap-3 bg-nexora-dark-2 border border-white/10 rounded-xl p-3">
                    <div className="w-10 h-10 rounded-full bg-nexora-red/20 flex items-center justify-center text-nexora-red font-bold text-sm flex-shrink-0">D</div>
                    <div>
                      <p className="font-medium text-sm">{content.director}</p>
                      <p className="text-gray-500 text-xs">Director</p>
                    </div>
                  </div>
                )}
                {content.cast?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {content.cast.map((actor: string) => (
                      <div key={actor} className="flex items-center gap-3 bg-nexora-dark-2 border border-white/10 rounded-xl p-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 font-bold text-sm flex-shrink-0">
                          {actor.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-sm truncate">{actor}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No hay información de reparto.</p>
                )}
              </div>
            )}

            {/* ── COMENTARIOS tab ── */}
            {activeTab === 'comments' && (
              <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-6 text-center">
                <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Los comentarios estarán disponibles próximamente.</p>
              </div>
            )}

            {/* ── RESEÑAS tab ── */}
            {activeTab === 'reviews' && (
              <div className="space-y-3">
                <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-4">
                  <p className="text-sm font-medium mb-1">Tu reseña</p>
                  <div className="flex gap-1 mb-2">
                    {[1,2,3,4,5].map((s) => (
                      <button key={s} onClick={() => { setUserRating(s); rateContent({ contentId: id, rating: s }); }}>
                        <Star className={cn('w-5 h-5 transition-colors', s <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600 hover:text-yellow-300')} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Escribe tu reseña..."
                    className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-nexora-red"
                  />
                  <button className="mt-2 px-4 py-1.5 bg-nexora-red hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Publicar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Similar ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-nexora-red rounded-full" />
              Similares
            </h3>
            <div className="space-y-3">
              {(similar || []).slice(0, 8).map((item: any) => (
                <Link key={item.id} href={`/watch/${item.id}`} className="flex gap-3 group">
                  <div className="relative w-20 aspect-[2/3] flex-shrink-0 rounded-lg overflow-hidden bg-nexora-dark-2">
                    {item.posterUrl && (
                      <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                    {item.averageRating > 0 && (
                      <div className="absolute top-1 left-1 bg-black/70 rounded px-1 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] text-yellow-400">{item.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-nexora-red transition-colors">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.releaseYear}</p>
                    {item.genres?.[0] && <p className="text-xs text-gray-600 mt-0.5 truncate">{item.genres[0]}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
