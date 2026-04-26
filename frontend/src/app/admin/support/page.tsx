'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminTickets, useSupportStats, useReplyTicket, useUpdateTicketStatus } from '@/hooks/useSupport';
import { HeadphonesIcon, Clock, Loader2, CheckCircle, XCircle, Filter, MessageSquare, Send } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

const CATEGORIES: Record<string, string> = {
  TECHNICAL: 'Problema técnico',
  BILLING:   'Pagos',
  CONTENT:   'Contenido',
  ACCOUNT:   'Cuenta',
  OTHER:     'Otro',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  OPEN:        { label: 'Abierto',    color: 'text-blue-400 bg-blue-400/10',    icon: Clock },
  IN_PROGRESS: { label: 'En proceso', color: 'text-yellow-400 bg-yellow-400/10', icon: Loader2 },
  RESOLVED:    { label: 'Resuelto',   color: 'text-green-400 bg-green-400/10',   icon: CheckCircle },
  CLOSED:      { label: 'Cerrado',    color: 'text-gray-400 bg-gray-400/10',     icon: XCircle },
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-4">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={cn('text-2xl font-bold mt-1', color)}>{value}</p>
    </div>
  );
}

export default function AdminSupportPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('RESOLVED');

  const { data, isLoading } = useAdminTickets(statusFilter ? { status: statusFilter } : undefined);
  const { data: stats } = useSupportStats();
  const replyTicket = useReplyTicket();
  const updateStatus = useUpdateTicketStatus();

  const tickets = data?.tickets || [];

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    await replyTicket.mutateAsync({ id, adminReply: replyText.trim(), status: replyStatus });
    setReplyId(null);
    setReplyText('');
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus.mutateAsync({ id, status });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Tickets de soporte</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona las consultas y problemas de los usuarios</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total"      value={stats.total}      color="text-white" />
            <StatCard label="Abiertos"   value={stats.open}       color="text-blue-400" />
            <StatCard label="En proceso" value={stats.inProgress} color="text-yellow-400" />
            <StatCard label="Resueltos"  value={stats.resolved}   color="text-green-400" />
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                statusFilter === s ? 'bg-nexora-red text-white' : 'bg-white/10 hover:bg-white/20 text-gray-300',
              )}
            >
              {s === '' ? 'Todos' : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>

        {/* Ticket list */}
        <div className="bg-nexora-dark-2 border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Cargando...</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <HeadphonesIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No hay tickets</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {tickets.map((ticket: any) => {
                const st = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
                return (
                  <div key={ticket.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-4 h-4 text-gray-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{ticket.subject}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {CATEGORIES[ticket.category] || 'Otro'} · {ticket.user?.email} · {formatDate(ticket.createdAt)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ticket.message}</p>
                          {ticket.adminReply && (
                            <p className="text-xs text-gray-500 mt-1 italic">Respuesta: {ticket.adminReply}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full', st.color)}>
                          <st.icon className="w-3 h-3" />
                          {st.label}
                        </span>

                        {/* Quick status change */}
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          className="text-xs bg-white/10 border border-white/10 rounded px-2 py-1 focus:outline-none"
                        >
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => setReplyId(replyId === ticket.id ? null : ticket.id)}
                          className="flex items-center gap-1 text-xs bg-nexora-red/20 hover:bg-nexora-red/40 text-nexora-red px-2 py-1 rounded transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          Responder
                        </button>
                      </div>
                    </div>

                    {/* Reply panel */}
                    {replyId === ticket.id && (
                      <div className="mt-3 p-3 bg-white/5 rounded-lg space-y-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Escribe tu respuesta al usuario..."
                          rows={3}
                          className="w-full bg-nexora-dark-3 border border-white/10 rounded px-3 py-2 text-sm focus:border-white/30 focus:outline-none resize-none"
                        />
                        <div className="flex items-center gap-3">
                          <select
                            value={replyStatus}
                            onChange={(e) => setReplyStatus(e.target.value)}
                            className="text-xs bg-nexora-dark-3 border border-white/10 rounded px-2 py-1.5 focus:outline-none"
                          >
                            <option value="IN_PROGRESS">Marcar: En proceso</option>
                            <option value="RESOLVED">Marcar: Resuelto</option>
                            <option value="CLOSED">Marcar: Cerrado</option>
                          </select>
                          <button
                            onClick={() => handleReply(ticket.id)}
                            disabled={replyTicket.isPending || !replyText.trim()}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-nexora-red hover:bg-nexora-red/80 text-white text-xs font-medium rounded transition-colors disabled:opacity-60"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Enviar respuesta
                          </button>
                          <button
                            onClick={() => { setReplyId(null); setReplyText(''); }}
                            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
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
