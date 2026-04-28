'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useContentById, useSignedUrl, useSimilarContent } from '@/hooks/useContent';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { ContentRow } from '@/components/content/ContentRow';
import { WatchPartyPanel } from '@/components/watch-party/WatchPartyPanel';
import { DownloadButton } from '@/components/content/DownloadButton';
import { Star, Plus, Play, Clock, Globe, Loader2, Server, ChevronDown } from 'lucide-react';
import { cn, formatDuration, getMaturityColor, detectVideoType } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useFavoriteToggle, useRateContent } from '@/hooks/useContent';
import toast from 'react-hot-toast';
import Link from 'next/link';

type VideoSource = {
  id: string;
  serverName: string;
  url: string;
  quality: string;
  type: 'DIRECT' | 'EMBED' | 'HLS';
  isDefault: boolean;
  order: number;
};

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const episodeId = searchParams.get('episode');
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(episodeId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [selectedSourceIdx, setSelectedSourceIdx] = useState(0);

  // Watch Party sync state
  const [partyCurrentTime, setPartyCurrentTime] = useState(0);
  const [partyIsPlaying, setPartyIsPlaying] = useState(false);
  const [seekTarget, setSeekTarget] = useState<number | undefined>(undefined);
  const [seekSeq, setSeekSeq] = useState(0);
  const [playTarget, setPlayTarget] = useState<boolean | undefined>(undefined);

  const handlePartySeek = useCallback((time: number) => {
    setSeekTarget(time);
    setSeekSeq((s) => s + 1);
  }, []);

  const handlePartyPlayPause = useCallback((playing: boolean) => {
    setPlayTarget(playing);
  }, []);

  const { activeProfile } = useAuthStore();
  const { data: content, isLoading } = useContentById(id);
  const { data: signedUrl } = useSignedUrl(id, selectedEpisode || undefined);
  const { data: similar } = useSimilarContent(id);
  const { mutate: toggleFavorite } = useFavoriteToggle();
  const { mutate: rateContent } = useRateContent();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-nexora-dark flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-nexora-red animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-nexora-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Contenido no encontrado</h2>
          <Link href="/" className="text-nexora-red hover:underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const currentSeason = content.seasons?.[selectedSeason];
  const episodes = currentSeason?.episodes || [];
  const currentEpisodeObj = episodes.find((e: any) => e.id === selectedEpisode);
  const currentEpisodeIndex = episodes.findIndex((e: any) => e.id === selectedEpisode);
  const nextEpisode = currentEpisodeIndex >= 0 ? episodes[currentEpisodeIndex + 1] : null;

  // Determine available sources for current playback target
  const availableSources: VideoSource[] = (() => {
    if (content.type === 'MOVIE') {
      if (content.videoSources && content.videoSources.length > 0) return content.videoSources;
      if (content.videoUrl) return [{ id: 'legacy', serverName: 'Principal', url: content.videoUrl, quality: 'Auto', type: 'DIRECT', isDefault: true, order: 0 }];
    } else if (currentEpisodeObj) {
      if (currentEpisodeObj.videoSources && currentEpisodeObj.videoSources.length > 0) return currentEpisodeObj.videoSources;
      if (currentEpisodeObj.videoUrl) return [{ id: 'legacy', serverName: 'Principal', url: currentEpisodeObj.videoUrl, quality: 'Auto', type: 'DIRECT', isDefault: true, order: 0 }];
    }
    return [];
  })();

  const activeSource = availableSources[selectedSourceIdx] || availableSources[0];
  // If activeSource exists use it; otherwise fall back to signedUrl (which now includes type)
  const rawUrl = activeSource?.url || signedUrl?.url || content.videoUrl || '';
  const typeHint = activeSource?.type || (signedUrl as any)?.type;
  // Auto-detect from URL pattern — explicit hint only wins for EMBED/HLS, never overrides domain detection
  const videoType = detectVideoType(rawUrl, typeHint);
  const videoUrl = rawUrl;

  const handlePlayEpisode = (epId: string) => {
    setSelectedEpisode(epId);
    setSelectedSourceIdx(0);
    setIsPlaying(true);
  };

  if (isPlaying && videoUrl) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <VideoPlayer
          key={`${videoUrl}-${videoType}`}
          contentId={id}
          videoUrl={videoUrl}
          videoType={videoType}
          title={content.title}
          episodeTitle={currentEpisodeObj?.title}
          subtitles={
            (currentEpisodeObj?.subtitles || content.subtitles || []).map((s: any) => ({
              id: s.id,
              language: s.language,
              label: s.label,
              url: s.url,
            }))
          }
          introStart={currentEpisodeObj?.introStart}
          introEnd={currentEpisodeObj?.introEnd}
          nextEpisode={nextEpisode ? { id: nextEpisode.id, title: nextEpisode.title } : undefined}
          profileId={activeProfile?.id}
          onBack={() => setIsPlaying(false)}
          onEnded={() => {
            if (nextEpisode) {
              setSelectedEpisode(nextEpisode.id);
              setSelectedSourceIdx(0);
            }
          }}
          onTimeUpdate={setPartyCurrentTime}
          onPlayStateChange={setPartyIsPlaying}
          externalSeek={seekTarget}
          externalSeekSeq={seekSeq}
          externalPlaying={playTarget}
          topBarExtra={
            <>
              {/* Server selector in player */}
              {availableSources.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {availableSources.map((src, i) => (
                    <button
                      key={src.id}
                      onClick={() => setSelectedSourceIdx(i)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                        i === selectedSourceIdx
                          ? 'bg-nexora-red text-white'
                          : 'bg-white/10 hover:bg-white/20 text-gray-300',
                      )}
                    >
                      <Server className="w-3 h-3" />
                      {src.serverName}
                      {src.quality && <span className="text-[10px] opacity-75">·{src.quality}</span>}
                    </button>
                  ))}
                </div>
              )}
              <WatchPartyPanel
                contentId={id}
                episodeId={selectedEpisode ?? undefined}
                currentTime={partyCurrentTime}
                isPlaying={partyIsPlaying}
                onSeek={handlePartySeek}
                onPlayPause={handlePartyPlayPause}
              />
            </>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nexora-dark">
      {/* Hero section */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <img
          src={content.bannerUrl || content.posterUrl}
          alt={content.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nexora-dark via-transparent to-black/40" />
        <div className="absolute inset-0 hero-gradient" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
        >
          ← Volver
        </button>
      </div>

      {/* Content info */}
      <div className="px-4 md:px-12 -mt-32 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="hidden md:block flex-shrink-0">
            <img
              src={content.posterUrl}
              alt={content.title}
              className="w-52 rounded-lg shadow-2xl"
            />
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black mb-4">{content.title}</h1>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-3 mb-4">
              <span className="text-green-400 font-medium">{content.releaseYear}</span>
              {content.maturityRating && (
                <span className={cn('text-white text-xs px-2 py-0.5 rounded font-medium', getMaturityColor(content.maturityRating))}>
                  {content.maturityRating}
                </span>
              )}
              {content.duration && (
                <span className="flex items-center gap-1 text-gray-300 text-sm">
                  <Clock className="w-4 h-4" />
                  {formatDuration(content.duration)}
                </span>
              )}
              {content.language && (
                <span className="flex items-center gap-1 text-gray-300 text-sm">
                  <Globe className="w-4 h-4" />
                  {content.language.toUpperCase()}
                </span>
              )}
              {content.averageRating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-medium">{content.averageRating.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({content._count?.ratings} valoraciones)</span>
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {content.genres?.map((g: string) => (
                <Link
                  key={g}
                  href={`/browse?genre=${g}`}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
                >
                  {g}
                </Link>
              ))}
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mb-6 leading-relaxed">
              {content.description}
            </p>

            {/* Credits */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 text-sm">
              {content.director && (
                <div>
                  <span className="text-gray-500">Director: </span>
                  <span>{content.director}</span>
                </div>
              )}
              {content.studio && (
                <div>
                  <span className="text-gray-500">Estudio: </span>
                  <span>{content.studio}</span>
                </div>
              )}
              {content.country && (
                <div>
                  <span className="text-gray-500">País: </span>
                  <span>{content.country}</span>
                </div>
              )}
            </div>

            {/* Cast */}
            {content.cast?.length > 0 && (
              <p className="text-sm text-gray-400 mb-6">
                <span className="text-gray-500">Reparto: </span>
                {content.cast.slice(0, 5).join(', ')}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  if (content.type !== 'MOVIE') {
                    const firstEp = content.seasons?.[0]?.episodes?.[0];
                    if (firstEp) setSelectedEpisode(firstEp.id);
                  }
                  setSelectedSourceIdx(0);
                  setIsPlaying(true);
                }}
                className="flex items-center gap-2 bg-white text-black font-bold px-8 py-3 rounded hover:bg-gray-200 transition-colors"
              >
                <Play className="w-5 h-5 fill-black" />
                {content.type === 'MOVIE' ? 'Reproducir' : 'Ver desde el inicio'}
              </button>

              <button
                onClick={() => toggleFavorite(content.id)}
                className="flex items-center gap-2 bg-white/10 border border-white/30 hover:bg-white/20 text-white font-medium px-6 py-3 rounded transition-colors"
              >
                <Plus className="w-5 h-5" />
                Mi lista
              </button>

              {content.type === 'MOVIE' && (
                <DownloadButton
                  contentId={id}
                  title={content.title}
                  posterUrl={content.posterUrl}
                  type={content.type}
                  duration={content.duration}
                  className="bg-white/10 border border-white/30 hover:bg-white/20 text-white px-6 py-3 rounded"
                />
              )}
            </div>

            {/* Movie server selector */}
            {content.type === 'MOVIE' && availableSources.length > 1 && (
              <div className="mt-5">
                <p className="text-sm text-gray-400 mb-2 flex items-center gap-1.5">
                  <Server className="w-4 h-4" /> Servidores disponibles:
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableSources.map((src, i) => (
                    <button
                      key={src.id}
                      onClick={() => setSelectedSourceIdx(i)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                        i === selectedSourceIdx
                          ? 'bg-nexora-red/20 border-nexora-red text-white'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40',
                      )}
                    >
                      <Server className="w-3.5 h-3.5" />
                      {src.serverName}
                      {src.quality && <span className="text-xs text-gray-400">· {src.quality}</span>}
                      {src.type === 'EMBED' && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded">iframe</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-2">Tu valoración:</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      setUserRating(star);
                      rateContent({ contentId: id, rating: star });
                    }}
                    className="group"
                  >
                    <Star
                      className={cn(
                        'w-6 h-6 transition-colors',
                        star <= userRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500 hover:text-yellow-300',
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Seasons & Episodes */}
        {content.type !== 'MOVIE' && content.seasons?.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-bold">Episodios</h2>
              {content.seasons.length > 1 && (
                <div className="relative">
                  <select
                    value={selectedSeason}
                    onChange={(e) => { setSelectedSeason(Number(e.target.value)); setSelectedSourceIdx(0); }}
                    className="bg-nexora-dark-3 border border-white/20 text-white px-3 py-2 pr-8 rounded text-sm appearance-none cursor-pointer"
                  >
                    {content.seasons.map((s: any, i: number) => (
                      <option key={s.id} value={i}>
                        {s.title || `Temporada ${s.number}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              {currentSeason?.episodes?.map((ep: any, idx: number) => {
                const epSources: VideoSource[] = ep.videoSources && ep.videoSources.length > 0
                  ? ep.videoSources
                  : ep.videoUrl ? [{ id: 'legacy', serverName: 'Principal', url: ep.videoUrl, quality: 'Auto', type: 'DIRECT', isDefault: true, order: 0 }] : [];

                const isSelected = selectedEpisode === ep.id;

                return (
                  <div
                    key={ep.id}
                    className={cn(
                      'flex gap-4 p-4 rounded-lg transition-colors group',
                      isSelected ? 'bg-white/10' : 'hover:bg-white/5',
                    )}
                  >
                    {/* Thumbnail */}
                    <div
                      className="flex-shrink-0 relative cursor-pointer"
                      onClick={() => handlePlayEpisode(ep.id)}
                    >
                      <img
                        src={ep.thumbnailUrl || `https://picsum.photos/seed/ep${idx}/400/225`}
                        alt={ep.title}
                        className="w-32 md:w-40 aspect-video object-cover rounded"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded">
                        <Play className="w-8 h-8 fill-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="cursor-pointer"
                          onClick={() => handlePlayEpisode(ep.id)}
                        >
                          <p className="font-medium">
                            {ep.number}. {ep.title}
                          </p>
                          {ep.duration && (
                            <p className="text-gray-400 text-xs mt-0.5">{ep.duration}min</p>
                          )}
                        </div>
                        <DownloadButton
                          contentId={id}
                          title={content.title}
                          posterUrl={content.posterUrl}
                          type={content.type}
                          episodeId={ep.id}
                          episodeTitle={ep.title}
                          seasonNumber={currentSeason?.number}
                          episodeNumber={ep.number}
                          duration={ep.duration}
                          iconOnly
                          className="flex-shrink-0 p-1.5 bg-white/5 hover:bg-white/10 rounded-lg"
                        />
                      </div>

                      {ep.description && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{ep.description}</p>
                      )}

                      {/* Server selector per episode */}
                      {epSources.length > 1 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {epSources.map((src, si) => (
                            <button
                              key={src.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEpisode(ep.id);
                                setSelectedSourceIdx(si);
                                setIsPlaying(true);
                              }}
                              className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-colors"
                            >
                              <Server className="w-2.5 h-2.5" />
                              {src.serverName}
                              {src.quality && <span className="opacity-60">·{src.quality}</span>}
                              {src.type === 'EMBED' && <span className="text-blue-400">iframe</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Similar content */}
        {similar && similar.length > 0 && (
          <div className="mt-12">
            <ContentRow title="Contenido similar" items={similar} />
          </div>
        )}
      </div>
    </div>
  );
}
