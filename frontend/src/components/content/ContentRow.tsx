'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentCard } from './ContentCard';
import { cn } from '@/lib/utils';

interface ContentRowProps {
  title: string;
  items: any[];
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export function ContentRow({ title, items, isLoading, size = 'md', showProgress }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return;
    const amount = dir === 'left' ? -600 : 600;
    rowRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  if (isLoading) {
    return (
      <div className="px-4 md:px-12 mb-8">
        <div className="h-6 w-48 skeleton rounded mb-3" />
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-40 md:w-52 aspect-[2/3] skeleton rounded flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="px-4 md:px-12 mb-8 group/row">
      <h2 className="text-lg md:text-xl font-bold mb-3 text-white">{title}</h2>

      <div className="relative">
        {/* Left fade + button */}
        {showLeft && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-16 row-fade-left z-10 pointer-events-none" />
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover/row:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Scrollable row */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-2 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
              size={size}
              showProgress={showProgress && item.watchHistory ? item.watchHistory[0]?.progress : undefined}
            />
          ))}
        </div>

        {/* Right fade + button */}
        {showRight && (
          <>
            <div className="absolute right-0 top-0 bottom-0 w-16 row-fade-right z-10 pointer-events-none" />
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover/row:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
