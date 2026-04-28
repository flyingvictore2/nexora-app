'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Trash2, Loader2, Users, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

export default function AdminSubscriptionsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'plans' | 'users'>('plans');
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userSubsPage, setUserSubsPage] = useState(1);
  const [userSubsStatus, setUserSubsStatus] = useState('');

  const { data: userSubs } = useQuery({
    queryKey: ['admin-user-subs', userSubsPage, userSubsStatus],
    queryFn: async () => (await api.get(`/subscriptions/admin/all?page=${userSubsPage}&limit=15${userSubsStatus ? `&status=${userSubsStatus}` : ''}`)).data.data,
    enabled: activeTab === 'users',
  });

  const cancelUserSub = useMutation({
    mutationFn: (id: string) => api.post(`/subscriptions/admin/${id}/cancel`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-user-subs'] }); toast.success('Suscripción cancelada'); },
    onError: () => toast.error('Error al cancelar'),
  });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => (await api.get('/subscriptions/plans')).data.data,
  });

  const { data: stats } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => (await api.get('/subscriptions/stats')).data.data,
  });

  const { data: revenue } = useQuery({
    queryKey: ['revenue-stats'],
    queryFn: async () => (await api.get('/payments/revenue')).data.data,
  });

  const updatePlan = useMutation({
    mutationFn: ({ id, data }: any) => api.put(`/subscriptions/plans/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-plans'] });
      toast.success('Plan actualizado');
      setEditingPlan(null);
    },
  });

  const createPlan = useMutation({
    mutationFn: (data: any) => api.post('/subscriptions/plans', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-plans'] });
      toast.success('Plan creado');
      setShowCreateForm(false);
    },
    onError: () => toast.error('Error al crear el plan'),
  });

  const deletePlan = useMutation({
    mutationFn: (id: string) => api.delete(`/subscriptions/plans/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-plans'] });
      toast.success('Plan eliminado');
    },
    onError: () => toast.error('Error al eliminar el plan'),
  });

  const planColors: Record<string, string> = {
    FREE: 'border-gray-600',
    PREMIUM: 'border-nexora-red',
    VIP: 'border-yellow-500',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Suscripciones</h1>
            <p className="text-gray-400 text-sm mt-1">Gestiona planes y suscripciones de usuarios</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-nexora-dark-2 border border-white/10 rounded-xl p-1 w-fit">
          {([['plans', 'Planes'], ['users', 'Usuarios']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-colors', activeTab === id ? 'bg-nexora-red text-white' : 'text-gray-400 hover:text-white')}>
              {label}
            </button>
          ))}
        </div>

        {/* User subscriptions tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <select value={userSubsStatus} onChange={(e) => { setUserSubsStatus(e.target.value); setUserSubsPage(1); }}
                className="bg-nexora-dark-3 border border-white/20 text-white text-sm px-3 py-2 rounded-lg">
                <option value="">Todos los estados</option>
                {['ACTIVE', 'TRIAL', 'CANCELLED', 'EXPIRED'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {userSubs && <span className="text-sm text-gray-400">{userSubs.total} suscripciones</span>}
            </div>

            <div className="bg-nexora-dark-2 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase border-b border-white/10">
                    {['Usuario', 'Plan', 'Estado', 'Inicio', 'Fin', ''].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(userSubs?.subscriptions ?? []).map((s: any) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-nexora-red flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {(s.user?.name || s.user?.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{s.user?.name || '—'}</p>
                            <p className="text-xs text-gray-400">{s.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{s.plan?.name}</td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs px-2 py-1 rounded-full font-medium',
                          s.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                          s.status === 'TRIAL' ? 'bg-blue-500/20 text-blue-400' :
                          s.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400')}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(s.currentPeriodStart)}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(s.currentPeriodEnd)}</td>
                      <td className="px-4 py-3">
                        {s.status === 'ACTIVE' && (
                          <button
                            onClick={() => { if (confirm('¿Cancelar esta suscripción?')) cancelUserSub.mutate(s.id); }}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {userSubs?.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setUserSubsPage((p) => Math.max(1, p - 1))} disabled={userSubsPage === 1}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-400">Pág. {userSubsPage} / {userSubs.totalPages}</span>
                <button onClick={() => setUserSubsPage((p) => Math.min(userSubs.totalPages, p + 1))} disabled={userSubsPage === userSubs.totalPages}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-40">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'plans' && (<>

        {/* Revenue stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Ingresos totales', value: formatCurrency(revenue?.total || 0), color: 'text-green-400' },
            { label: 'Este mes', value: formatCurrency(revenue?.thisMonth || 0), color: 'text-blue-400' },
            { label: 'Este año', value: formatCurrency(revenue?.thisYear || 0), color: 'text-yellow-400' },
            { label: 'Transacciones', value: (revenue?.totalTransactions || 0).toLocaleString(), color: 'text-white' },
          ].map((s) => (
            <div key={s.label} className="bg-nexora-dark-2 border border-white/10 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Subscription stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Activas', value: stats.active, color: 'text-green-400' },
              { label: 'En prueba', value: stats.trial, color: 'text-blue-400' },
              { label: 'Canceladas', value: stats.cancelled, color: 'text-red-400' },
            ].map((s) => (
              <div key={s.label} className="bg-nexora-dark-2 border border-white/10 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Plans header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Planes activos</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-nexora-red hover:bg-nexora-red-dark text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo plan
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-72 skeleton rounded-xl" />
              ))
            : plans.map((plan: any) => (
                <div
                  key={plan.id}
                  className={cn('bg-nexora-dark-2 border-2 rounded-xl p-5', planColors[plan.planType] || 'border-gray-600')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      <p className="text-2xl font-black mt-1">
                        {plan.price === 0 ? 'Gratis' : formatCurrency(plan.price)}
                        {plan.price > 0 && <span className="text-sm font-normal text-gray-400">/mes</span>}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingPlan(plan); setShowForm(true); }}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el plan "${plan.name}"?`)) deletePlan.mutate(plan.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm border-t border-white/10 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Calidad</span>
                      <span className="font-medium">{plan.videoQuality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Perfiles</span>
                      <span className="font-medium">{plan.maxProfiles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dispositivos</span>
                      <span className="font-medium">{plan.maxDevices}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prueba gratuita</span>
                      <span className="font-medium">{plan.trialDays > 0 ? `${plan.trialDays} días` : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Descargas</span>
                      <span className={plan.hasDownloads ? 'text-green-400' : 'text-red-400'}>
                        {plan.hasDownloads ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>

                  {plan.trialDays > 0 && (
                    <p className="text-green-400 text-xs mt-3">
                      {plan.trialDays} días de prueba gratuita
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', plan.isActive ? 'bg-green-400' : 'bg-red-400')} />
                    <span className="text-xs text-gray-400">{plan.isActive ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </div>
              ))}
        </div>
        </>)}
      </div>

      {/* Create Plan Modal */}
      {showCreateForm && (
        <PlanCreateModal
          onClose={() => setShowCreateForm(false)}
          onSave={(data) => createPlan.mutate(data)}
          isSaving={createPlan.isPending}
        />
      )}

      {/* Edit Plan Modal */}
      {showForm && editingPlan && (
        <PlanEditModal
          plan={editingPlan}
          onClose={() => { setShowForm(false); setEditingPlan(null); }}
          onSave={(data) => updatePlan.mutate({ id: editingPlan.id, data })}
          isSaving={updatePlan.isPending}
        />
      )}
    </AdminLayout>
  );
}

function PlanCreateModal({ onClose, onSave, isSaving }: any) {
  const [form, setForm] = useState({
    name: '',
    planType: 'PREMIUM',
    price: 9.99,
    currency: 'USD',
    description: '',
    features: [] as string[],
    maxProfiles: 2,
    maxDevices: 2,
    videoQuality: 'HD',
    hasDownloads: false,
    trialDays: 0,
    isActive: true,
  });
  const [featureInput, setFeatureInput] = useState('');

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-nexora-dark-2 border border-white/10 rounded-xl shadow-2xl my-4">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="font-bold">Crear nuevo plan</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nombre</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm" placeholder="Premium Plus" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tipo</label>
              <select value={form.planType} onChange={(e) => setForm({ ...form, planType: e.target.value })}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm">
                {['FREE', 'PREMIUM', 'VIP'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Precio/mes</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Moneda</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm">
                {['USD', 'EUR', 'MXN', 'ARS', 'COP', 'CLP', 'PEN', 'BRL', 'GBP'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Máx. perfiles</label>
              <input type="number" value={form.maxProfiles} onChange={(e) => setForm({ ...form, maxProfiles: parseInt(e.target.value) })}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Máx. dispositivos</label>
              <input type="number" value={form.maxDevices} onChange={(e) => setForm({ ...form, maxDevices: parseInt(e.target.value) })}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Calidad de video</label>
              <select value={form.videoQuality} onChange={(e) => setForm({ ...form, videoQuality: e.target.value })}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm">
                {['SD', 'HD', '4K'].map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Días de prueba</label>
              <input type="number" value={form.trialDays} onChange={(e) => setForm({ ...form, trialDays: parseInt(e.target.value) })}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2} className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm resize-none" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Características</label>
            <div className="flex gap-2 mb-2">
              <input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && featureInput.trim()) { setForm({ ...form, features: [...form.features, featureInput.trim()] }); setFeatureInput(''); }}}
                placeholder="Escribe y pulsa Enter" className="flex-1 bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm" />
            </div>
            <div className="flex flex-wrap gap-2">
              {form.features.map((f, i) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded">
                  {f}
                  <button onClick={() => setForm({ ...form, features: form.features.filter((_, j) => j !== i) })} className="text-gray-400 hover:text-red-400">✕</button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.hasDownloads} onChange={(e) => setForm({ ...form, hasDownloads: e.target.checked })} className="accent-nexora-red" />
              <span className="text-sm">Descargas</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-nexora-red" />
              <span className="text-sm">Activo</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-white/10">
          <button onClick={onClose} className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={isSaving || !form.name}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-nexora-red hover:bg-nexora-red-dark text-white rounded-lg text-sm font-medium disabled:opacity-60">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Crear plan
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanEditModal({ plan, onClose, onSave, isSaving }: any) {
  const [form, setForm] = useState({
    price: plan.price,
    trialDays: plan.trialDays,
    maxProfiles: plan.maxProfiles,
    maxDevices: plan.maxDevices,
    videoQuality: plan.videoQuality,
    hasDownloads: plan.hasDownloads,
    isActive: plan.isActive,
    stripePriceId: plan.stripePriceId || '',
  });

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-nexora-dark-2 border border-white/10 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="font-bold">Editar plan: {plan.name}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Precio/mes</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Días de prueba</label>
              <input
                type="number"
                value={form.trialDays}
                onChange={(e) => setForm({ ...form, trialDays: parseInt(e.target.value) })}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Máx. perfiles</label>
              <input
                type="number"
                value={form.maxProfiles}
                onChange={(e) => setForm({ ...form, maxProfiles: parseInt(e.target.value) })}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Máx. dispositivos</label>
              <input
                type="number"
                value={form.maxDevices}
                onChange={(e) => setForm({ ...form, maxDevices: parseInt(e.target.value) })}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Calidad de video</label>
            <select
              value={form.videoQuality}
              onChange={(e) => setForm({ ...form, videoQuality: e.target.value })}
              className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm"
            >
              {['SD', 'HD', '4K'].map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Stripe Price ID</label>
            <input
              value={form.stripePriceId}
              onChange={(e) => setForm({ ...form, stripePriceId: e.target.value })}
              className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm font-mono"
              placeholder="price_..."
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasDownloads}
                onChange={(e) => setForm({ ...form, hasDownloads: e.target.checked })}
                className="accent-nexora-red"
              />
              <span className="text-sm">Descargas</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="accent-nexora-red"
              />
              <span className="text-sm">Activo</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-white/10">
          <button onClick={onClose} className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-nexora-red hover:bg-nexora-red-dark text-white rounded-lg text-sm font-medium"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
