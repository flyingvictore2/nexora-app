'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, AlertTriangle, Eye, EyeOff, Globe, CreditCard, Zap, Crown, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { key: 'browse',   label: 'Inicio / Browse' },
  { key: 'new',      label: 'Novedades' },
  { key: 'requests', label: 'Solicitudes' },
  { key: 'support',  label: 'Soporte' },
  { key: 'plans',    label: 'Planes / Suscripción' },
];

const CURRENCIES = ['USD', 'EUR', 'MXN', 'ARS', 'COP', 'CLP', 'PEN', 'BRL', 'GBP'];

export default function AdminSettingsPage() {
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => (await api.get('/settings')).data.data,
  });

  const [form, setForm] = useState({
    maintenanceMode: false,
    maintenanceMsg: 'Estamos realizando tareas de mantenimiento. Volvemos pronto.',
    hiddenSections: [] as string[],
    currency: 'USD',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        maintenanceMode: settings.maintenanceMode ?? false,
        maintenanceMsg: settings.maintenanceMsg ?? '',
        hiddenSections: settings.hiddenSections ?? [],
        currency: settings.currency ?? 'USD',
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => api.patch('/settings', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Configuración guardada');
    },
    onError: () => toast.error('Error al guardar la configuración'),
  });

  const toggleSection = (key: string) => {
    setForm((f) => ({
      ...f,
      hiddenSections: f.hiddenSections.includes(key)
        ? f.hiddenSections.filter((s) => s !== key)
        : [...f.hiddenSections, key],
    }));
  };

  if (isLoading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-nexora-red" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Configuración del sitio</h1>
          <p className="text-gray-400 text-sm mt-1">Controla el comportamiento global de la plataforma</p>
        </div>

        {/* Maintenance mode */}
        <section className="bg-nexora-dark-2 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h2 className="font-semibold text-lg">Modo mantenimiento</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Activar modo mantenimiento</p>
              <p className="text-xs text-gray-400 mt-0.5">Los usuarios verán la página de mantenimiento. Los admins pueden seguir accediendo.</p>
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, maintenanceMode: !f.maintenanceMode }))}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                form.maintenanceMode ? 'bg-yellow-500' : 'bg-white/20',
              )}
            >
              <span className={cn(
                'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                form.maintenanceMode ? 'translate-x-7' : 'translate-x-1',
              )} />
            </button>
          </div>

          {form.maintenanceMode && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-300">
              ⚠️ El sitio estará en mantenimiento para usuarios normales.
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Mensaje de mantenimiento</label>
            <textarea
              value={form.maintenanceMsg}
              onChange={(e) => setForm((f) => ({ ...f, maintenanceMsg: e.target.value }))}
              rows={3}
              className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-nexora-red/50"
            />
          </div>
        </section>

        {/* Hidden sections */}
        <section className="bg-nexora-dark-2 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <EyeOff className="w-5 h-5 text-blue-400" />
            <h2 className="font-semibold text-lg">Visibilidad de secciones</h2>
          </div>
          <p className="text-xs text-gray-400">Las secciones ocultadas no aparecerán en el menú de navegación para los usuarios.</p>

          <div className="space-y-3">
            {SECTIONS.map((section) => {
              const hidden = form.hiddenSections.includes(section.key);
              return (
                <div key={section.key} className="flex items-center justify-between py-2 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    {hidden
                      ? <EyeOff className="w-4 h-4 text-gray-500" />
                      : <Eye className="w-4 h-4 text-green-400" />}
                    <span className="text-sm font-medium">{section.label}</span>
                  </div>
                  <button
                    onClick={() => toggleSection(section.key)}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors',
                      !hidden ? 'bg-green-500' : 'bg-white/20',
                    )}
                  >
                    <span className={cn(
                      'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                      !hidden ? 'translate-x-7' : 'translate-x-1',
                    )} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Currency */}
        <section className="bg-nexora-dark-2 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-green-400" />
            <h2 className="font-semibold text-lg">Moneda</h2>
          </div>
          <p className="text-xs text-gray-400">Moneda que se mostrará en los precios de los planes.</p>

          <div className="grid grid-cols-3 gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => setForm((f) => ({ ...f, currency: c }))}
                className={cn(
                  'py-2.5 rounded-lg text-sm font-medium border transition-colors',
                  form.currency === c
                    ? 'border-nexora-red bg-nexora-red/20 text-white'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Plans */}
        <PlansToggleSection />

        {/* Save */}
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-nexora-red hover:bg-nexora-red-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar configuración
        </button>
      </div>
    </AdminLayout>
  );
}

const planIcons: Record<string, any> = { FREE: Star, PREMIUM: Zap, VIP: Crown };
const planColors: Record<string, string> = {
  FREE: 'text-gray-400',
  PREMIUM: 'text-nexora-red',
  VIP: 'text-yellow-400',
};

function PlansToggleSection() {
  const qc = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['admin-plans-all'],
    queryFn: async () => {
      const res = await api.get('/subscriptions/plans/all');
      return res.data?.data ?? [];
    },
  });

  const togglePlan = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.put(`/subscriptions/plans/${id}`, { isActive }),
    onSuccess: (_, { isActive }) => {
      qc.invalidateQueries({ queryKey: ['admin-plans-all'] });
      qc.invalidateQueries({ queryKey: ['admin-plans'] });
      qc.invalidateQueries({ queryKey: ['plans'] });
      toast.success(isActive ? 'Plan activado' : 'Plan desactivado');
    },
    onError: () => toast.error('Error al cambiar el estado del plan'),
  });

  return (
    <section className="bg-nexora-dark-2 border border-white/10 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <CreditCard className="w-5 h-5 text-nexora-red" />
        <h2 className="font-semibold text-lg">Activar / Desactivar planes</h2>
      </div>
      <p className="text-xs text-gray-400">Los planes desactivados no aparecerán en la página de suscripciones ni podrán contratarse.</p>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 skeleton rounded-lg" />)}
        </div>
      ) : plans.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">No hay planes creados.</p>
      ) : (
        <div className="space-y-3">
          {plans.map((plan: any) => {
            const Icon = planIcons[plan.planType] || Star;
            const colorClass = planColors[plan.planType] || 'text-gray-400';
            const isPending = togglePlan.isPending && (togglePlan.variables as any)?.id === plan.id;

            return (
              <div key={plan.id} className="flex items-center justify-between p-4 bg-nexora-dark-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${colorClass}`} />
                  <div>
                    <p className="font-semibold text-sm">{plan.name}</p>
                    <p className="text-xs text-gray-500">
                      {plan.price === 0 ? 'Gratis' : `${plan.price} ${plan.currency || 'USD'}/mes`}
                      {' · '}
                      <span className={plan.isActive ? 'text-green-400' : 'text-red-400'}>
                        {plan.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  disabled={isPending}
                  onClick={() => togglePlan.mutate({ id: plan.id, isActive: !plan.isActive })}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors disabled:opacity-50',
                    plan.isActive ? 'bg-green-500' : 'bg-white/20',
                  )}
                >
                  {isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin absolute top-1.5 left-4 text-white" />
                  ) : (
                    <span className={cn(
                      'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                      plan.isActive ? 'translate-x-7' : 'translate-x-1',
                    )} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
