'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminRequests, useRequestStats, useUpdateRequestStatus } from '@/hooks/useRequests';
import { Film, Tv, Sword, HelpCircle, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

const TYPES: Record<string, { label: string; icon: any }> = {
  MOVIE:  { label: 'Película', icon: Film },
  SERIES: { label: 'Serie',    icon: Tv },
  ANIME:  { label: 'Anime',    icon: Sword },
  OTHER:  { label: 'Otro',     icon: HelpCircle },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:  { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-400/10', icon: Clock },
  APPROVED: { label: 'Aprobada',  color: 'text-green-400 bg-green-400/10',   icon: CheckCircle },
  REJECTED: { label: 'Rechazada', color: 'text-red-400 bg-red-400/10',       icon: XCircle },
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-4">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={cn('text-2xl font-bold mt-1', color)}>{value}</p>
    </div>
  );
}

export default function AdminRequestsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState('');

  const { data, isLoading } = useAdminRequests(statusFilter ? { status: statusFilter } : undefined);
  const { data: stats } = useRequestStats();
  const updateStatus = useUpdateRequestStatus();

  const requests = data?.requests || [];

  const handleAction = async (id: string, status: string) => {
    await updateStatus.mutateAsync({ id, status, adminNote: actionNote.trim() || undefined });
    setActionId(null);
    setActionNote('');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Solicitudes de contenido</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona las peticiones de los usuarios</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total"      value={stats.total}    color="text-white" />
            <StatCard label="Pendientes" value={stats.pending}  color="text-yellow-400" />
            <StatCard label="Aprobadas"  value={stats.approved} color="text-green-400" />
            <StatCard label="Rechazadas" value={stats.rejected} color="text-red-400" />
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                statusFilter === s ? 'bg-nexora-red text-white' : 'bg-white/10 hover:bg-white/20 text-gray-300',
              )}
            >
              {s === '' ? 'Todas' : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-nexora-dark-2 border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Cargando...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <Film className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No hay solicitudes</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {requests.map((req: any) => {
                const TypeInfo = TYPES[req.type] || TYPES.OTHER;
                const st = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
                return (
                  <div key={req.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                          <TypeInfo.icon className="w-4 h-4 text-gray-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{req.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {TypeInfo.label} · {req.user?.email} · {formatDate(req.createdAt)}
                          </p>
                          {req.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{req.description}</p>
                          )}
                          {req.adminNote && (
                            <p className="text-xs text-gray-500 mt-1 italic">Nota: {req.adminNote}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full', st.color)}>
                          <st.icon className="w-3 h-3" />
                          {st.label}
                        </span>
                        {req.status === 'PENDING' && (
                          <button
                            onClick={() => setActionId(actionId === req.id ? null : req.id)}
                            className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
                          >
                            Gestionar
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline action panel */}
                    {actionId === req.id && (
                      <div className="mt-3 p-3 bg-white/5 rounded-lg space-y-3">
                        <input
                          type="text"
                          value={actionNote}
                          onChange={(e) => setActionNote(e.target.value)}
                          placeholder="Nota para el usuario (opcional)..."
                          className="w-full bg-nexora-dark-3 border border-white/10 rounded px-3 py-2 text-sm focus:border-white/30 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(req.id, 'APPROVED')}
                            disabled={updateStatus.isPending}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-60"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'REJECTED')}
                            disabled={updateStatus.isPending}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-medium rounded transition-colors disabled:opacity-60"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rechazar
                          </button>
                          <button
                            onClick={() => { setActionId(null); setActionNote(''); }}
                            className="px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
