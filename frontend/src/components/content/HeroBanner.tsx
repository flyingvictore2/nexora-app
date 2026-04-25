'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Info, Plus, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavoriteToggle } from '@/hooks/useContent';
import { cn, formatDuration, getMaturityColor } from '@/lib/utils';

interface HeroBannerProps {
  items: any[];
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const { mutate: toggleFavorite } = useFavoriteToggle();

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % items.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const featured = items[current];

  return (
    <div className="relative h-[70vh] md:h-[85vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={featured.bannerUrl || featured.posterUrl}
              alt={featured.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Gradients */}
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 hero-gradient-bottom" />
          <div className="absolute inset-0 bg-gradient-to-t from-nexora-dark via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full px-4 md:px-12 pb-20 md:pb-28">
        <motion.div
          key={`content-${current}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl"
        >
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-nexora-red font-bold uppercase text-xs tracking-widest">
              {featured.type === 'MOVIE' ? 'Película' : featured.type === 'SERIES' ? 'Serie' : 'Anime'}
            </span>
            {featured.isNew && (
              <span className="bg-nexora-red text-white text-xs px-2 py-0.5 rounded-sm font-medium">
                NUEVO
              </span>
            )}
            {featured.isTrending && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-sm font-medium">
                TENDENCIA
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black mb-3 leading-tight drop-shadow-lg">
            {featured.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-green-400 font-medium">{featured.releaseYear}</span>
            {featured.maturityRating && (
              <span className={cn('text-white text-xs px-1.5 py-0.5 rounded', getMaturityColor(featured.maturityRating))}>
                {featured.maturityRating}
              </span>
            )}
            {featured.duration && (
              <span className="text-gray-300 text-sm">{formatDuration(featured.duration)}</span>
            )}
            {featured.averageRating > 0 && (
              <span className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400">{featured.averageRating.toFixed(1)}</span>
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-6 max-w-lg drop-shadow">
            {featured.description}
          </p>

          {/* Genres */}
          {featured.genres?.length > 0 && (
            <p className="text-gray-400 text-sm mb-5">
              {featured.genres.slice(0, 4).join(' • ')}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href={`/watch/${featured.id}`}
              className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded hover:bg-gray-200 transition-colors text-sm md:text-base"
            >
              <Play className="w-5 h-5 fill-black" />
              Reproducir
            </Link>
            <Link
              href={`/watch/${featured.id}`}
              className="flex items-center gap-2 bg-gray-600/70 text-white font-medium px-6 py-3 rounded hover:bg-gray-600 transition-colors text-sm md:text-base backdrop-blur-sm"
            >
              <Info className="w-5 h-5" />
              Más info
            </Link>
            <button
              onClick={() => toggleFavorite(featured.id)}
              className="w-11 h-11 rounded-full border-2 border-white/60 flex items-center justify-center hover:border-white transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Pagination dots */}
      {items.length > 1 && (
        <div className="absolute bottom-6 right-12 flex gap-2 z-10">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                i === current ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
