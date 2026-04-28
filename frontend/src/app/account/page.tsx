'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/auth.store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, CreditCard, Shield, Eye, EyeOff,
  CheckCircle, Loader2, ExternalLink, Palette,
} from 'lucide-react';
import { useThemeStore, ACCENT_COLORS } from '@/store/theme.store';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
});

type PasswordForm = z.infer<typeof passwordSchema>;

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'subscription', label: 'Suscripción', icon: CreditCard },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'payments', label: 'Pagos', icon: CreditCard },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const { user, refreshUser } = useAuthStore();
  const { accentColorId, setAccentColor } = useThemeStore();

  const { data: subscription } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: async () => (await api.get('/subscriptions/my')).data.data,
  });

  const { data: payments } = useQuery({
    queryKey: ['payment-history'],
    queryFn: async () => (await api.get('/payments/history')).data.data,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const portalMutation = useMutation({
    mutationFn: () => api.post('/payments/portal'),
    onSuccess: (data) => {
      window.location.href = data.data.data.url;
    },
    onError: () => toast.error('Error al acceder al portal de facturación'),
  });

  const changePassword = async (data: PasswordForm) => {
    try {
      await api.post('/auth/change-password', data);
      toast.success('Contraseña actualizada');
      reset();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  const planBadgeColor: Record<string, string> = {
    FREE: 'bg-gray-600/30 text-gray-300',
    PREMIUM: 'bg-nexora-red/20 text-nexora-red',
    VIP: 'bg-yellow-600/20 text-yellow-400',
  };

  return (
    <div className="min-h-screen bg-nexora-dark">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-16 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mi cuenta</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-48 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors text-left',
                    activeTab === id
                      ? 'bg-nexora-red/20 text-white font-medium'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white',
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Profile tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-6">
                  <h2 className="font-semibold mb-4">Información de cuenta</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-sm font-medium mt-0.5">{user?.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {user?.isEmailVerified ? (
                          <span className="flex items-center gap-1 text-green-400 text-xs">
                            <CheckCircle className="w-3.5 h-3.5" /> Verificado
                          </span>
                        ) : (
                          <span className="text-orange-400 text-xs">Sin verificar</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <div>
                        <p className="text-xs text-gray-400">Rol</p>
                        <p className="text-sm font-medium mt-0.5">{user?.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-xs text-gray-400">Perfiles</p>
                        <p className="text-sm font-medium mt-0.5">{user?.profiles?.length || 0} perfil(es)</p>
                      </div>
                      <Link href="/profiles" className="text-nexora-red hover:underline text-sm">
                        Gestionar →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-4">
                <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-6">
                  <h2 className="font-semibold mb-4">Plan actual</h2>
                  {subscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={cn('px-3 py-1 rounded-full text-sm font-medium', planBadgeColor[subscription.plan?.planType || 'FREE'])}>
                            Plan {subscription.plan?.name}
                          </span>
                          <p className="text-gray-400 text-sm mt-2">
                            Estado: <span className={subscription.status === 'ACTIVE' ? 'text-green-400' : 'text-orange-400'}>
                              {subscription.status}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {subscription.plan?.price === 0 ? 'Gratis' : formatCurrency(subscription.plan?.price)}
                          </p>
                          {subscription.plan?.price > 0 && (
                            <p className="text-gray-400 text-xs">/mes</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Calidad</span>
                          <span>{subscription.plan?.videoQuality}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Perfiles</span>
                          <span>Hasta {subscription.plan?.maxProfiles}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Dispositivos</span>
                          <span>Hasta {subscription.plan?.maxDevices}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Próxima facturación</span>
                          <span>{formatDate(subscription.currentPeriodEnd)}</span>
                        </div>
                        {subscription.cancelAtPeriodEnd && (
                          <div className="flex justify-between">
                            <span className="text-orange-400">Cancela el</span>
                            <span className="text-orange-400">{formatDate(subscription.currentPeriodEnd)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 flex-wrap">
                        <Link
                          href="/subscription/plans"
                          className="flex items-center gap-2 bg-nexora-red hover:bg-nexora-red-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Cambiar plan
                        </Link>
                        {subscription.plan?.price > 0 && (
                          <button
                            onClick={() => portalMutation.mutate()}
                            disabled={portalMutation.isPending}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            {portalMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            <ExternalLink className="w-4 h-4" />
                            Portal de facturación
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">No tienes una suscripción activa</p>
                      <Link href="/subscription/plans" className="bg-nexora-red hover:bg-nexora-red-dark text-white px-6 py-2 rounded-lg font-medium transition-colors">
                        Ver planes
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security tab */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-6">
                  <h2 className="font-semibold mb-4">Cambiar contraseña</h2>
                  <form onSubmit={handleSubmit(changePassword)} className="space-y-4 max-w-sm">
                    <div className="relative">
                      <label className="block text-xs text-gray-400 mb-1">Contraseña actual</label>
                      <input
                        {...register('currentPassword')}
                        type={showCurrentPw ? 'text' : 'password'}
                        className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2.5 text-sm pr-10"
                      />
                      <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 bottom-2.5 text-gray-400">
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {errors.currentPassword && <p className="text-red-400 text-xs mt-1">{errors.currentPassword.message}</p>}
                    </div>

                    <div className="relative">
                      <label className="block text-xs text-gray-400 mb-1">Nueva contraseña</label>
                      <input
                        {...register('newPassword')}
                        type={showNewPw ? 'text' : 'password'}
                        className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2.5 text-sm pr-10"
                      />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 bottom-2.5 text-gray-400">
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-nexora-red hover:bg-nexora-red-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Actualizar contraseña
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Payments tab */}
            {activeTab === 'payments' && (
              <div className="bg-nexora-dark-2 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-white/10">
                  <h2 className="font-semibold">Historial de pagos</h2>
                </div>
                {payments?.payments?.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {payments.payments.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between px-5 py-4">
                        <div>
                          <p className="text-sm font-medium">{p.description || 'Suscripción'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(p.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(p.amount, p.currency)}</p>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full', p.status === 'COMPLETED' ? 'bg-green-600/20 text-green-400' : p.status === 'FAILED' ? 'bg-red-600/20 text-red-400' : 'bg-yellow-600/20 text-yellow-400')}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Sin transacciones</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-6">
                  <h2 className="font-semibold mb-1">Color de acento</h2>
                  <p className="text-gray-400 text-sm mb-5">Cambia el color principal de la interfaz</p>
                  <div className="flex flex-wrap gap-4">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setAccentColor(c.id)}
                        title={c.name}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                          accentColorId === c.id ? 'border-white scale-105' : 'border-transparent hover:border-white/30',
                        )}
                      >
                        <div
                          className="w-10 h-10 rounded-full shadow-lg"
                          style={{ background: c.hex }}
                        />
                        <span className="text-xs text-gray-300">{c.name}</span>
                        {accentColorId === c.id && (
                          <CheckCircle className="w-4 h-4 text-white -mt-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
