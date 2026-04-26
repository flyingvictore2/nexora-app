'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useMyTickets, useSubmitTicket } from '@/hooks/useSupport';
import { HeadphonesIcon, Clock, Loader2, CheckCircle, XCircle, PlusCircle, MessageSquare } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

const CATEGORIES = [
  { value: 'TECHNICAL', label: 'Problema técnico' },
  { value: 'BILLING',   label: 'Pagos y facturación' },
  { value: 'CONTENT',   label: 'Contenido' },
  { value: 'ACCOUNT',   label: 'Mi cuenta' },
  { value: 'OTHER',     label: 'Otro' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  OPEN:        { label: 'Abierto',      color: 'text-blue-400 bg-blue-400/10',    icon: Clock },
  IN_PROGRESS: { label: 'En proceso',   color: 'text-yellow-400 bg-yellow-400/10', icon: Loader2 },
  RESOLVED:    { label: 'Resuelto',     color: 'text-green-400 bg-green-400/10',   icon: CheckCircle },
  CLOSED:      { label: 'Cerrado',      color: 'text-gray-400 bg-gray-400/10',     icon: XCircle },
};

export default function SupportPage() {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('TECHNICAL');

  const { data: tickets = [], isLoading } = useMyTickets();
  const submit = useSubmitTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    await submit.mutateAsync({ subject: subject.trim(), message: message.trim(), category });
    setSubject('');
    setMessage('');
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-nexora-dark">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-16 max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Soporte</h1>
            <p className="text-gray-400 text-sm mt-1">
              ¿Tienes algún problema? Estamos aquí para ayudarte.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-nexora-red hover:bg-nexora-red/80 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Nuevo ticket
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-nexora-dark-2 border border-white/10 rounded-xl p-6 mb-8 space-y-5">
            <h2 className="font-semibold text-lg">Nuevo ticket de soporte</h2>

            {/* Category */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-nexora-dark-3 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-white/30 focus:outline-none transition-colors"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Asunto *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Describe brevemente el problema..."
                required
                className="w-full bg-nexora-dark-3 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-white/30 focus:outline-none transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Mensaje *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explícanos con detalle qué ocurre, qué has probado, en qué dispositivo..."
                rows={5}
                required
                className="w-full bg-nexora-dark-3 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-white/30 focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submit.isPending || !subject.trim() || !message.trim()}
                className="px-6 py-2 bg-nexora-red hover:bg-nexora-red/80 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {submit.isPending ? 'Enviando...' : 'Enviar ticket'}
              </button>
            </div>
          </form>
        )}

        {/* Ticket list */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 skeleton rounded-xl" />
            ))
          ) : tickets.length === 0 ? (
            <div className="text-center py-20">
              <HeadphonesIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">Sin tickets todavía</p>
              <p className="text-gray-500 text-sm">Si tienes algún problema, crea un nuevo ticket.</p>
            </div>
          ) : (
            tickets.map((ticket: any) => {
              const st = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
              return (
                <div key={ticket.id} className="bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-gray-300" />
                      </div>
                      <div>
                        <p className="font-semibold">{ticket.subject}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {CATEGORIES.find(c => c.value === ticket.category)?.label} · {formatDate(ticket.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={cn('flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0', st.color)}>
                      <st.icon className="w-3.5 h-3.5" />
                      {st.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 mt-3 line-clamp-2">{ticket.message}</p>

                  {ticket.adminReply && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg border-l-2 border-nexora-red">
                      <p className="text-xs text-gray-400 mb-1 font-medium">Respuesta del equipo</p>
                      <p className="text-sm text-gray-300">{ticket.adminReply}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
