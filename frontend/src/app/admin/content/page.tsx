'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Search, Edit, Trash2, Eye, Star, Film,
  Loader2, MoreVertical, Check, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';
import { ContentForm } from '@/components/admin/ContentForm';

export default function AdminContentPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-content', page, search, type],
    queryFn: async () => {
      const res = await api.get('/content', {
        params: { page, limit: 20, search: search || undefined, type: type || undefined },
      });
      return res.data.data;
    },
  });

  const deleteContent = useMutation({
    mutationFn: (id: string) => api.delete(`/content/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-content'] });
      toast.success('Contenido eliminado');
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, isFeatured }: any) => api.put(`/content/${id}`, { isFeatured }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-content'] }),
  });

  const TYPE_LABELS: Record<string, string> = { MOVIE: 'Película', SERIES: 'Serie', ANIME: 'Anime' };
  const TYPE_COLORS: Record<string, string> = {
    MOVIE: 'bg-blue-600/20 text-blue-400',
    SERIES: 'bg-green-600/20 text-green-400',
    ANIME: 'bg-purple-600/20 text-purple-400',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Contenido</h1>
            <p className="text-gray-400 text-sm">{data?.total || 0} títulos en la plataforma</p>
          </div>
          <button
            onClick={() => { setEditingContent(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-nexora-red hover:bg-nexora-red-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Añadir contenido
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar contenido..."
              className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg pl-9 pr-4 py-2 text-sm"
            />
          </div>
          {['', 'MOVIE', 'SERIES', 'ANIME'].map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setPage(1); }}
              className={cn(
                'px-3 py-2 rounded-lg text-sm transition-colors',
                type === t ? 'bg-nexora-red text-white' : 'bg-white/10 hover:bg-white/20',
              )}
            >
              {t === '' ? 'Todo' : TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-nexora-dark-2 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Contenido</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Año</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Vistas</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Rating</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Estado</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 skeleton rounded w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data?.content?.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-nexora-dark-3">
                          {item.posterUrl && <img src={item.posterUrl} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate max-w-48">{item.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-48">
                            {item.genres?.slice(0, 2).join(', ')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-1 rounded-full', TYPE_COLORS[item.type])}>
                        {TYPE_LABELS[item.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{item.releaseYear}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm">
                        <Eye className="w-3 h-3 text-gray-400" />
                        {item.totalViews?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm text-yellow-400">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        {item.averageRating?.toFixed(1) || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full w-fit', item.isPublished ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400')}>
                          {item.isPublished ? 'Publicado' : 'Borrador'}
                        </span>
                        {item.isFeatured && (
                          <span className="text-xs px-2 py-0.5 rounded-full w-fit bg-yellow-600/20 text-yellow-400">
                            Destacado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingContent(item); setShowForm(true); }}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar "${item.title}"?`)) deleteContent.mutate(item.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-600/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Página {page} de {data.totalPages}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-white/10 rounded text-sm disabled:opacity-40">
                  Anterior
                </button>
                <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="px-3 py-1 bg-white/10 rounded text-sm disabled:opacity-40">
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Form Modal */}
      {showForm && (
        <ContentForm
          content={editingContent}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ['admin-content'] });
          }}
        />
      )}
    </AdminLayout>
  );
}
