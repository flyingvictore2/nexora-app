'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useMyRequests, useSubmitRequest } from '@/hooks/useRequests';
import { Film, Tv, Sword, HelpCircle, Clock, CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

const TYPES = [
  { value: 'MOVIE',  label: 'Película',   icon: Film },
  { value: 'SERIES', label: 'Serie',      icon: Tv },
  { value: 'ANIME',  label: 'Anime',      icon: Sword },
  { value: 'OTHER',  label: 'Otro',       icon: HelpCircle },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:  { label: 'Pendiente',  color: 'text-yellow-400 bg-yellow-400/10', icon: Clock },
  APPROVED: { label: 'Aprobada',   color: 'text-green-400 bg-green-400/10',   icon: CheckCircle },
  REJECTED: { label: 'Rechazada',  color: 'text-red-400 bg-red-400/10',       icon: XCircle },
};

export default function RequestsPage() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('MOVIE');
  const [description, setDescription] = useState('');

  const { data: requests = [], isLoading } = useMyRequests();
  const submit = useSubmitRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await submit.mutateAsync({ title: title.trim(), type, description: description.trim() || undefined });
    setTitle('');
    setDescription('');
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-nexora-dark">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-16 max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Solicitudes</h1>
            <p className="text-gray-400 text-sm mt-1">
              ¿No encuentras lo que buscas? Pídenos que lo añadamos.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-nexora-red hover:bg-nexora-red/80 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Nueva solicitud
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-nexora-dark-2 border border-white/10 rounded-xl p-6 mb-8 space-y-5">
            <h2 className="font-semibold text-lg">Nueva solicitud de contenido</h2>

            {/* Type selector */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Tipo de contenido</label>
              <div className="flex gap-2 flex-wrap">
                {TYPES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
                      type === value
                        ? 'bg-nexora-red border-nexora-red text-white'
                        : 'border-white/10 hover:border-white/30 text-gray-300',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Título *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre de la película, serie o anime..."
                required
                className="w-full bg-nexora-dark-3 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-white/30 focus:outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Descripción adicional (opcional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Año, temporada, idioma preferido... cualquier detalle que ayude."
                rows={3}
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
                disabled={submit.isPending || !title.trim()}
                className="px-6 py-2 bg-nexora-red hover:bg-nexora-red/80 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {submit.isPending ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        )}

        {/* List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 skeleton rounded-xl" />
            ))
          ) : requests.length === 0 ? (
            <div className="text-center py-20">
              <Film className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">Sin solicitudes todavía</p>
              <p className="text-gray-500 text-sm">Pulsa "Nueva solicitud" para pedir contenido.</p>
            </div>
          ) : (
            requests.map((req: any) => {
              const st = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
              const TypeIcon = TYPES.find(t => t.value === req.type)?.icon || HelpCircle;
              return (
                <div key={req.id} className="bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="w-5 h-5 text-gray-300" />
                      </div>
                      <div>
                        <p className="font-semibold">{req.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {TYPES.find(t => t.value === req.type)?.label} · {formatDate(req.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={cn('flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0', st.color)}>
                      <st.icon className="w-3.5 h-3.5" />
                      {st.label}
                    </span>
                  </div>

                  {req.description && (
                    <p className="text-sm text-gray-400 mt-3 pl-13">{req.description}</p>
                  )}

                  {req.adminNote && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg border-l-2 border-nexora-red">
                      <p className="text-xs text-gray-400 mb-1 font-medium">Respuesta del equipo</p>
                      <p className="text-sm text-gray-300">{req.adminNote}</p>
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
