'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useDownloadsStore } from '@/store/downloads.store';
import { Download, Trash2, Play, Film, Tv } from 'lucide-react';
import Link from 'next/link';
import { formatDuration } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DownloadsPage() {
  const { downloads, remove, clear } = useDownloadsStore();

  const handleRemove = (id: string) => {
    remove(id);
    toast.success('Descarga eliminada');
  };

  return (
    <div className="min-h-screen bg-nexora-dark">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-16 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Download className="w-7 h-7 text-nexora-red" />
            <h1 className="text-3xl font-bold">Mis Descargas</h1>
          </div>
          {downloads.length > 0 && (
            <button
              onClick={() => { if (confirm('¿Eliminar todas las descargas?')) { clear(); toast.success('Descargas eliminadas'); } }}
              className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar todo
            </button>
          )}
        </div>

        {downloads.length === 0 ? (
          <div className="text-center py-24">
            <Download className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-400 mb-2">No tienes descargas</p>
            <p className="text-gray-500 text-sm mb-6">Guarda películas y episodios para verlos cuando quieras</p>
            <Link href="/browse" className="bg-nexora-red hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Explorar contenido
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {downloads.map((item) => (
              <div key={item.id} className="flex gap-4 bg-nexora-dark-2 rounded-xl p-3 group">
                {/* Poster */}
                <div className="relative flex-shrink-0 w-20 aspect-[2/3] rounded-lg overflow-hidden bg-nexora-dark-3">
                  {item.posterUrl ? (
                    <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === 'MOVIE' ? <Film className="w-6 h-6 text-gray-500" /> : <Tv className="w-6 h-6 text-gray-500" />}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <p className="font-semibold truncate">{item.title}</p>
                    {item.episodeTitle && (
                      <p className="text-sm text-gray-400 truncate mt-0.5">
                        {item.seasonNumber && `T${item.seasonNumber} · `}
                        {item.episodeNumber && `Ep.${item.episodeNumber} · `}
                        {item.episodeTitle}
                      </p>
                    )}
                    {item.duration && (
                      <p className="text-xs text-gray-500 mt-1">{formatDuration(item.duration)}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      Guardado el {new Date(item.addedAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Link
                      href={`/watch/${item.contentId}${item.episodeId ? `?episode=${item.episodeId}` : ''}`}
                      className="flex items-center gap-1.5 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-black" /> Reproducir
                    </Link>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
