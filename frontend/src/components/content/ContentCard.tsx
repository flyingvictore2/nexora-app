'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Play, Plus, ThumbsUp, ChevronDown, Star, ListPlus, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDuration, getMaturityColor } from '@/lib/utils';
import { useFavoriteToggle } from '@/hooks/useContent';
import { useContentLists, useAddToList, useRemoveFromList } from '@/hooks/useLists';

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    posterUrl?: string;
    bannerUrl?: string;
    trailerUrl?: string;
    type: string;
    releaseYear: number;
    genres?: string[];
    averageRating?: number;
    duration?: number;
    maturityRating?: string;
    _count?: { seasons?: number };
  };
  size?: 'sm' | 'md' | 'lg';
  showProgress?: number;
}

/* ─── Add-to-list dropdown ──────────────────────────────────── */
function AddToListDropdown({ contentId, onClose }: { contentId: string; onClose: () => void }) {
  const { data: lists, isLoading } = useContentLists(contentId);
  const { mutate: addToList, isPending: adding } = useAddToList();
  const { mutate: removeFromList, isPending: removing } = useRemoveFromList();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (isLoading) {
    return (
      <div ref={ref} className="absolute right-0 bottom-10 z-30 bg-nexora-dark border border-white/10 rounded-lg shadow-xl py-3 px-4 min-w-[180px] flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-400">Cargando listas…</span>
      </div>
    );
  }

  if (!lists || lists.length === 0) {
    return (
      <div ref={ref} className="absolute right-0 bottom-10 z-30 bg-nexora-dark border border-white/10 rounded-lg shadow-xl py-3 px-4 min-w-[180px]">
        <p className="text-xs text-gray-400 text-center">Sin listas. Crea una en Mi Lista.</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="absolute right-0 bottom-10 z-30 bg-nexora-dark border border-white/10 rounded-lg shadow-xl py-1 min-w-[190px]">
      <p className="text-xs text-gray-500 px-3 pt-1.5 pb-1">Añadir a lista</p>
      {lists.map((list: any) => {
        const inList = list.hasContent;
        const busy = adding || removing;
        return (
          <button
            key={list.id}
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (inList) {
                removeFromList({ listId: list.id, contentId });
              } else {
                addToList({ listId: list.id, contentId });
              }
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5 text-left transition-colors disabled:opacity-60"
          >
            <span className="text-base">{list.emoji}</span>
            <span className="flex-1 truncate">{list.name}</span>
            {inList && <Check className="w-3.5 h-3.5 text-nexora-red flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

export function ContentCard({ content, size = 'md', showProgress }: ContentCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showLists, setShowLists] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const trailerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { mutate: toggleFavorite } = useFavoriteToggle();

  const sizeClasses = {
    sm: 'w-32 md:w-40',
    md: 'w-40 md:w-52',
    lg: 'w-52 md:w-64',
  };

  return (
    <motion.div
      className={cn('relative flex-shrink-0 rounded overflow-hidden group', sizeClasses[size])}
      onHoverStart={() => {
        setHovered(true);
        if (content.trailerUrl) {
          trailerTimerRef.current = setTimeout(() => setShowTrailer(true), 1200);
        }
      }}
      onHoverEnd={() => {
        setHovered(false);
        setShowLists(false);
        setShowTrailer(false);
        if (trailerTimerRef.current) clearTimeout(trailerTimerRef.current);
      }}
      layout
    >
      {/* Poster */}
      <Link href={`/watch/${content.id}`}>
        <div className="relative aspect-[2/3] bg-nexora-dark-3 rounded overflow-hidden">
          {content.posterUrl ? (
            <img
              src={content.posterUrl}
              alt={content.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-nexora-dark-3">
              <span className="text-gray-500 text-center px-2 text-xs">{content.title}</span>
            </div>
          )}

          {/* Trailer autoplay */}
          {showTrailer && content.trailerUrl && (
            <video
              src={content.trailerUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-10"
            />
          )}

          {/* Progress bar */}
          {showProgress !== undefined && showProgress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
              <div
                className="h-full bg-nexora-red transition-all"
                style={{ width: `${Math.min(showProgress, 100)}%` }}
              />
            </div>
          )}

          {/* Play overlay on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-6 h-6 text-black fill-black ml-1" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>

      {/* Hover card */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-56 bg-nexora-dark-2 border border-white/10 rounded-md shadow-2xl z-20 overflow-hidden"
            style={{ minWidth: '200px' }}
          >
            {/* Banner */}
            <div className="relative h-28 bg-nexora-dark-3">
              <img
                src={content.bannerUrl || content.posterUrl || ''}
                alt={content.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nexora-dark-2 to-transparent" />
            </div>

            <div className="p-3">
              <h3 className="font-semibold text-sm line-clamp-1">{content.title}</h3>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-2">
                <Link
                  href={`/watch/${content.id}`}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 flex-shrink-0"
                >
                  <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); toggleFavorite(content.id); }}
                  className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center hover:border-white flex-shrink-0"
                  title="Favoritos"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {/* Add to list */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowLists((v) => !v); }}
                    className={cn(
                      'w-8 h-8 rounded-full border flex items-center justify-center transition-colors',
                      showLists ? 'border-nexora-red text-nexora-red' : 'border-white/40 hover:border-white',
                    )}
                    title="Añadir a lista"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {showLists && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.1 }}
                      >
                        <AddToListDropdown
                          contentId={content.id}
                          onClose={() => setShowLists(false)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center hover:border-white flex-shrink-0">
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <Link
                  href={`/watch/${content.id}`}
                  className="ml-auto w-8 h-8 rounded-full border border-white/40 flex items-center justify-center hover:border-white flex-shrink-0"
                >
                  <ChevronDown className="w-4 h-4" />
                </Link>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-green-400 text-xs font-medium">
                  {content.releaseYear}
                </span>
                {content.maturityRating && (
                  <span className={cn('text-white text-xs px-1 py-0.5 rounded text-[10px]', getMaturityColor(content.maturityRating))}>
                    {content.maturityRating}
                  </span>
                )}
                {content.duration && (
                  <span className="text-gray-400 text-xs">{formatDuration(content.duration)}</span>
                )}
                {content._count?.seasons && (
                  <span className="text-gray-400 text-xs">{content._count.seasons} temp.</span>
                )}
              </div>

              {/* Rating */}
              {content.averageRating && content.averageRating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-yellow-400">{content.averageRating.toFixed(1)}</span>
                </div>
              )}

              {/* Genres */}
              {content.genres && content.genres.length > 0 && (
                <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                  {content.genres.slice(0, 3).join(' • ')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
