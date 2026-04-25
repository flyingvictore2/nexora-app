'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, UserX, UserCheck, Eye, Mail, Shield,
  ChevronDown, Calendar, Activity,
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import Link from 'next/link';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const res = await api.get('/users', { params: { page, limit: 20, search: search || undefined } });
      return res.data.data;
    },
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => (await api.get('/users/stats')).data.data,
  });

  const blockUser = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      api.patch(`/users/${id}/${blocked ? 'block' : 'unblock'}`),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(vars.blocked ? 'Usuario bloqueado' : 'Usuario desbloqueado');
    },
    onError: () => toast.error('Error al actualizar usuario'),
  });

  const makeAdmin = useMutation({
    mutationFn: (id: string) => api.put(`/users/${id}`, { role: 'ADMIN' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuario promovido a Admin');
    },
  });

  const planColors: Record<string, string> = {
    FREE: 'bg-gray-600/20 text-gray-400',
    PREMIUM: 'bg-nexora-red/20 text-nexora-red',
    VIP: 'bg-yellow-600/20 text-yellow-400',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-400 text-sm mt-1">Administra todas las cuentas de la plataforma</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: userStats?.total || 0, color: 'text-white' },
            { label: 'Activos', value: userStats?.active || 0, color: 'text-green-400' },
            { label: 'Bloqueados', value: userStats?.blocked || 0, color: 'text-red-400' },
            { label: 'Verificados', value: userStats?.verified || 0, color: 'text-blue-400' },
          ].map((s) => (
            <div key={s.label} className="bg-nexora-dark-2 border border-white/10 rounded-xl p-4 text-center">
              <p className={cn('text-2xl font-bold', s.color)}>{s.value.toLocaleString()}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por email..."
            className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg pl-9 pr-4 py-2 text-sm"
          />
        </div>

        {/* Table */}
        <div className="bg-nexora-dark-2 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Usuario</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Rol</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Plan</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Estado</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Registro</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Último acceso</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 skeleton rounded w-24" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : data?.users?.map((user: any) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-nexora-red/30 flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate max-w-40">{user.email}</p>
                              <p className="text-xs text-gray-400">
                                {user.profiles?.map((p: any) => p.name).join(', ')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'text-xs px-2 py-1 rounded-full',
                            user.role === 'ADMIN' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-white/10 text-gray-300',
                          )}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'text-xs px-2 py-1 rounded-full',
                            planColors[user.subscription?.plan?.planType || 'FREE'],
                          )}>
                            {user.subscription?.plan?.name || 'Sin plan'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-full w-fit',
                              user.isBlocked ? 'bg-red-600/20 text-red-400' : 'bg-green-600/20 text-green-400',
                            )}>
                              {user.isBlocked ? 'Bloqueado' : 'Activo'}
                            </span>
                            {!user.isEmailVerified && (
                              <span className="text-xs px-2 py-0.5 rounded-full w-fit bg-orange-600/20 text-orange-400">
                                Sin verificar
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {user.lastLoginAt ? formatDate(user.lastLoginAt) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedUser(user)}
                              title="Ver actividad"
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                            >
                              <Activity className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => blockUser.mutate({ id: user.id, blocked: !user.isBlocked })}
                              title={user.isBlocked ? 'Desbloquear' : 'Bloquear'}
                              className={cn(
                                'p-1.5 rounded transition-colors',
                                user.isBlocked
                                  ? 'text-green-400 hover:bg-green-600/10'
                                  : 'text-gray-400 hover:text-red-400 hover:bg-red-600/10',
                              )}
                            >
                              {user.isBlocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            </button>
                            {user.role !== 'ADMIN' && (
                              <button
                                onClick={() => {
                                  if (confirm(`¿Hacer admin a ${user.email}?`)) makeAdmin.mutate(user.id);
                                }}
                                title="Hacer admin"
                                className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-600/10 rounded"
                              >
                                <Shield className="w-4 h-4" />
                              </button>
                            )}
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
                {data.total} usuarios · Página {page}/{data.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white/10 rounded text-sm disabled:opacity-40 hover:bg-white/20"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="px-3 py-1 bg-white/10 rounded text-sm disabled:opacity-40 hover:bg-white/20"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User activity modal */}
      {selectedUser && (
        <UserActivityModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </AdminLayout>
  );
}

function UserActivityModal({ user, onClose }: { user: any; onClose: () => void }) {
  const { data: activity, isLoading } = useQuery({
    queryKey: ['user-activity', user.id],
    queryFn: async () => (await api.get(`/users/${user.id}/activity`)).data.data,
  });

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-nexora-dark-2 border border-white/10 rounded-xl shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h3 className="font-bold">Actividad de {user.email}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Historial de visualización y valoraciones</p>
          </div>
          <button onClick={onClose} className="p-1 hover:text-gray-300">
            <Search className="w-4 h-4" />✕
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 skeleton rounded" />
              ))}
            </div>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Últimos vídeos vistos</h4>
                <div className="space-y-2">
                  {activity?.watchHistory?.slice(0, 8).map((h: any) => (
                    <div key={h.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                      {h.content?.posterUrl && (
                        <img src={h.content.posterUrl} alt="" className="w-8 h-10 object-cover rounded flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{h.content?.title}</p>
                        <p className="text-xs text-gray-400">
                          {Math.round((h.progress / 60))}min visto
                          {h.completed && ' ✓'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatDate(h.watchedAt)}
                      </span>
                    </div>
                  )) || <p className="text-gray-500 text-sm">Sin historial</p>}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Valoraciones</h4>
                <div className="space-y-2">
                  {activity?.ratings?.map((r: any) => (
                    <div key={r.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{r.content?.title}</p>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < r.rating ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                        ))}
                      </div>
                    </div>
                  )) || <p className="text-gray-500 text-sm">Sin valoraciones</p>}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <button onClick={onClose} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
