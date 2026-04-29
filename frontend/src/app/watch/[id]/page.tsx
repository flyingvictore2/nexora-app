'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useContentById, useSignedUrl, useSimilarContent, useFavoriteToggle, useRateContent } from '@/hooks/useContent';
import { DownloadButton } from '@/components/content/DownloadButton';
import { WatchPartyPanel } from '@/components/watch-party/WatchPartyPanel';
import {
  Star, Play, Clock, Globe, Loader2, Server,
  ChevronDown, Monitor, Lightbulb, LightbulbOff, ArrowLeft,
  MessageSquare, Heart, ExternalLink, Check,
} from 'lucide-react';
import { cn, formatDuration, getMaturityColor, detectVideoType } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

/* ─── Types ─────────────────────────────────────────────────── */
type VideoSource = {
  id: string; serverName: string; url: string;
  quality: string; type: 'DIRECT' | 'EMBED' | 'HLS';
  isDefault: boolean; order: number;
};
type Tab = 'links' | 'cast' | 'comments' | 'reviews';

/* ─── Inline player ─────────────────────────────────────────── */
function InlinePlayer({
  url, type, title,
}: { url: string; type: 'DIRECT' | 'EMBED' | 'HLS'; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (type !== 'HLS' || !videoRef.current) return;
    // Dynamic HLS.js for m3u8 streams
    import('hls.js').then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoRef.current!);
        return () => hls.destroy();
      } else if (videoRef.current!.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current!.src = url;
      }
    }).catch(() => {
      if (videoRef.current) videoRef.current.src = url;
    });
  }, [url, type]);

  if (type === 'EMBED') {
    return (
      <iframe
        src={url}
        className="w-full h-full border-0"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-top-navigation-by-user-activation"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
        loading="eager"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={type === 'DIRECT' ? url : undefined}
      controls
      autoPlay
      className="w-full h-full"
      title={title}
    />
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedSeason, setSelectedSeason] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(
    searchParams.get('episode'),
  );
  const [selectedSourceIdx, setSelectedSourceIdx] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [lightsOff, setLightsOff] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('links');
  const [userRating, setUserRating] = useState(0);

  const { activeProfile } = useAuthStore();
  const { data: content, isLoading } = useContentById(id);
  const { data: signedUrl } = useSignedUrl(id, selectedEpisode || undefined);
  const { data: similar } = useSimilarContent(id);
  const { mutate: toggleFavorite } = useFavoriteToggle();
  const { mutate: rateContent } = useRateContent();

  // Reset player when episode / source changes
  useEffect(() => { setShowPlayer(false); }, [selectedEpisode]);

  /* ── Source resolution ── */
  const currentSeason = content?.seasons?.[selectedSeason];
  const episodes = currentSeason?.episodes || [];
  const currentEpisodeObj = episodes.find((e: any) => e.id === selectedEpisode);
  const nextEpisode = (() => {
    const idx = episodes.findIndex((e: any) => e.id === selectedEpisode);
    return idx >= 0 ? episodes[idx + 1] : null;
  })();

  const availableSources: VideoSource[] = (() => {
    if (!content) return [];
    if (content.type === 'MOVIE') {
      if (content.videoSources?.length) return content.videoSources;
      if (content.videoUrl) return [{ id: 'legacy', serverName: 'Servidor 1', url: content.videoUrl, quality: 'Auto', type: detectVideoType(content.videoUrl) as any, isDefault: true, order: 0 }];
    } else if (currentEpisodeObj) {
      if (currentEpisodeObj.videoSources?.length) return currentEpisodeObj.videoSources;
      if (currentEpisodeObj.videoUrl) return [{ id: 'legacy', serverName: 'Servidor 1', url: currentEpisodeObj.videoUrl, quality: 'Auto', type: detectVideoType(currentEpisodeObj.videoUrl) as any, isDefault: true, order: 0 }];
    }
    return [];
  })();

  const activeSource = availableSources[selectedSourceIdx] ?? availableSources[0];
  const rawUrl = activeSource?.url || (signedUrl as any)?.url || content?.videoUrl || '';
  const typeHint = activeSource?.type || (signedUrl as any)?.type;
  const videoType = detectVideoType(rawUrl, typeHint);

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
      {/* Lights-off overlay */}
      {lightsOff && (
        <div
          className="fixed inset-0 bg-black/85 z-10 cursor-pointer"
          onClick={() => setLightsOff(false)}
        />
      )}

      {/* ── Header ── */}
      <div className="relative">
        {/* Banner blur bg */}
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

          {/* ── Center: Content + Player ── */}
          <div className="flex-1 min-w-0">
            {/* Genres + meta row */}
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
                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (content.type !== 'MOVIE' && !selectedEpisode) {
                        const firstEp = content.seasons?.[0]?.episodes?.[0];
                        if (firstEp) setSelectedEpisode(firstEp.id);
                      }
                      setSelectedSourceIdx(0);
                      setShowPlayer(true);
                    }}
                    className="flex items-center gap-2 bg-nexora-red hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    <Monitor className="w-4 h-4" /> VER ONLINE
                  </button>
                  <button
                    onClick={() => window.open(rawUrl, '_blank')}
                    disabled={!rawUrl}
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

                {/* ── Season/Episode selector (series) ── */}
                {content.type !== 'MOVIE' && content.seasons?.length > 0 && (
                  <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-sm font-bold">Episodios</h3>
                      {content.seasons.length > 1 && (
                        <div className="relative">
                          <select
                            value={selectedSeason}
                            onChange={(e) => { setSelectedSeason(Number(e.target.value)); setSelectedEpisode(null); }}
                            className="bg-nexora-dark-3 border border-white/20 text-white text-sm px-3 py-1.5 pr-7 rounded appearance-none cursor-pointer"
                          >
                            {content.seasons.map((s: any, i: number) => (
                              <option key={s.id} value={i}>{s.title || `Temporada ${s.number}`}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                      {currentSeason?.episodes?.map((ep: any) => {
                        const isActive = selectedEpisode === ep.id;
                        return (
                          <button
                            key={ep.id}
                            onClick={() => { setSelectedEpisode(ep.id); setSelectedSourceIdx(0); setShowPlayer(true); }}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                              isActive ? 'bg-nexora-red/20 text-white' : 'text-gray-300 hover:bg-white/5',
                            )}
                          >
                            {isActive
                              ? <Play className="w-3.5 h-3.5 text-nexora-red flex-shrink-0 fill-nexora-red" />
                              : <span className="w-3.5 text-center text-gray-500 text-xs flex-shrink-0">{ep.number}</span>
                            }
                            <span className="flex-1 truncate">{ep.title}</span>
                            {ep.duration && <span className="text-xs text-gray-500 flex-shrink-0">{ep.duration}m</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Inline player area ── */}
                {showPlayer && rawUrl && (
                  <div className={cn('relative z-20', lightsOff && 'z-20')}>
                    {/* Controls bar */}
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <button
                        onClick={() => setShowPlayer(false)}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" /> Volver
                      </button>
                      <div className="flex items-center gap-3">
                        <WatchPartyPanel
                          contentId={id}
                          episodeId={selectedEpisode ?? undefined}
                          currentTime={0}
                          isPlaying={false}
                          onSeek={() => {}}
                          onPlayPause={() => {}}
                        />
                        <button
                          onClick={() => setLightsOff((v) => !v)}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          {lightsOff
                            ? <><Lightbulb className="w-3.5 h-3.5" /> Encender luces</>
                            : <><LightbulbOff className="w-3.5 h-3.5" /> Apagar luces</>
                          }
                        </button>
                      </div>
                    </div>

                    {/* Server tabs */}
                    {availableSources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {availableSources.map((src, i) => (
                          <button
                            key={src.id}
                            onClick={() => setSelectedSourceIdx(i)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                              i === selectedSourceIdx
                                ? 'bg-nexora-red border-nexora-red text-white'
                                : 'bg-nexora-dark-2 border-white/20 text-gray-300 hover:border-white/40',
                            )}
                          >
                            <Server className="w-3 h-3" />
                            {src.serverName}
                            {src.quality && src.quality !== 'Auto' && (
                              <span className="opacity-60">· {src.quality}</span>
                            )}
                            {i === selectedSourceIdx && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Player container */}
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                      <InlinePlayer
                        key={`${rawUrl}-${videoType}`}
                        url={rawUrl}
                        type={videoType}
                        title={currentEpisodeObj?.title || content.title}
                      />
                    </div>

                    {/* Next episode */}
                    {nextEpisode && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => { setSelectedEpisode(nextEpisode.id); setSelectedSourceIdx(0); }}
                          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors"
                        >
                          Siguiente: {nextEpisode.title} →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* No sources message */}
                {!rawUrl && (
                  <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-8 text-center">
                    <Monitor className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No hay fuentes de reproducción disponibles.</p>
                  </div>
                )}
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
