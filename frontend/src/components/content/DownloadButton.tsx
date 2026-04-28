'use client';

import { Download, Check } from 'lucide-react';
import { useDownloadsStore } from '@/store/downloads.store';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface DownloadButtonProps {
  contentId: string;
  title: string;
  posterUrl?: string;
  type: string;
  episodeId?: string;
  episodeTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  duration?: number;
  className?: string;
  iconOnly?: boolean;
}

export function DownloadButton({
  contentId, title, posterUrl, type,
  episodeId, episodeTitle, seasonNumber, episodeNumber, duration,
  className, iconOnly,
}: DownloadButtonProps) {
  const { add, remove, has } = useDownloadsStore();
  const saved = has(contentId, episodeId);

  const toggle = () => {
    const id = `${contentId}-${episodeId ?? 'movie'}`;
    if (saved) {
      remove(id);
      toast('Eliminado de descargas');
    } else {
      add({ contentId, title, posterUrl, type, episodeId, episodeTitle, seasonNumber, episodeNumber, duration });
      toast.success('Guardado en descargas');
    }
  };

  return (
    <button
      onClick={toggle}
      title={saved ? 'Eliminar de descargas' : 'Guardar en descargas'}
      className={cn(
        'flex items-center gap-1.5 transition-colors',
        saved ? 'text-nexora-red' : 'text-gray-400 hover:text-white',
        className,
      )}
    >
      {saved ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
      {!iconOnly && <span className="text-xs">{saved ? 'Guardado' : 'Descargar'}</span>}
    </button>
  );
}
