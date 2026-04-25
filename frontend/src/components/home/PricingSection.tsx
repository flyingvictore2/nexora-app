'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, Zap, Crown, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { cn, formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const planIcons = { FREE: Star, PREMIUM: Zap, VIP: Crown };
const planColors = {
  FREE: 'border-gray-600',
  PREMIUM: 'border-nexora-red',
  VIP: 'border-yellow-500',
};
const planButtonColors = {
  FREE: 'bg-gray-700 hover:bg-gray-600',
  PREMIUM: 'bg-nexora-red hover:bg-nexora-red-dark',
  VIP: 'bg-yellow-600 hover:bg-yellow-500',
};

export function PricingSection() {
  const { isAuthenticated } = useAuthStore();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => (await api.get('/subscriptions/plans')).data.data,
  });

  const { data: currentSub } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: async () => (await api.get('/subscriptions/my')).data.data,
    enabled: isAuthenticated,
  });

  const checkout = useMutation({
    mutationFn: (planId: string) => api.post('/payments/checkout', { planId }),
    onSuccess: (data) => {
      if (data.data.data?.url) window.location.href = data.data.data.url;
    },
    onError: () => toast.error('Error al procesar el pago'),
  });

  return (
    <section className="px-4 md:px-12 py-16 bg-nexora-dark">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black mb-3">
          Elige tu plan <span className="gradient-text">Nexora</span>
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto text-sm md:text-base">
          Disfruta de streaming ilimitado de películas, series y anime. Cancela cuando quieras.
        </p>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex flex-col md:flex-row justify-center gap-6 max-w-5xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1 h-96 skeleton rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan: any) => {
            const Icon = planIcons[plan.planType as keyof typeof planIcons] || Star;
            const isCurrent = currentSub?.plan?.planType === plan.planType;

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative bg-nexora-dark-2 border-2 rounded-xl p-6 transition-all hover:scale-105',
                  planColors[plan.planType as keyof typeof planColors] || 'border-gray-600',
                  plan.planType === 'PREMIUM' && 'md:scale-105',
                )}
              >
                {plan.planType === 'PREMIUM' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-nexora-red text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    MÁS POPULAR
                  </div>
                )}
                {plan.planType === 'VIP' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    MEJOR VALOR
                  </div>
                )}

                <div className="text-center mb-6">
                  <Icon
                    className={cn(
                      'w-12 h-12 mx-auto mb-3',
                      plan.planType === 'VIP'
                        ? 'text-yellow-400'
                        : plan.planType === 'PREMIUM'
                        ? 'text-nexora-red'
                        : 'text-gray-400',
                    )}
                  />
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="mt-3">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-black">Gratis</span>
                    ) : (
                      <>
                        <span className="text-4xl font-black">{formatCurrency(plan.price)}</span>
                        <span className="text-gray-400 text-sm">/mes</span>
                      </>
                    )}
                  </div>
                  {plan.trialDays > 0 && (
                    <p className="text-green-400 text-sm mt-1">{plan.trialDays} días gratis</p>
                  )}
                </div>

                {/* Specs */}
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-gray-400">Calidad</span>
                    <span className="font-medium">{plan.videoQuality}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-gray-400">Perfiles</span>
                    <span className="font-medium">{plan.maxProfiles}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-gray-400">Dispositivos</span>
                    <span className="font-medium">{plan.maxDevices}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Descargas</span>
                    <span className="font-medium">{plan.hasDownloads ? '✓' : '✗'}</span>
                  </div>
                </div>

                {/* Features */}
                {plan.features?.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f: string) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA */}
                {isCurrent ? (
                  <button disabled className="w-full py-3 rounded-lg font-bold bg-green-600/30 text-green-400 cursor-default">
                    Plan actual ✓
                  </button>
                ) : !isAuthenticated ? (
                  <Link
                    href="/auth/register"
                    className={cn(
                      'block w-full py-3 rounded-lg font-bold text-center text-white transition-colors',
                      planButtonColors[plan.planType as keyof typeof planButtonColors] || 'bg-gray-700',
                    )}
                  >
                    {plan.price === 0 ? 'Empezar gratis' : 'Comenzar'}
                  </Link>
                ) : plan.price === 0 ? (
                  <button disabled className="w-full py-3 rounded-lg font-bold bg-gray-700 opacity-50 cursor-default">
                    Plan básico
                  </button>
                ) : (
                  <button
                    onClick={() => checkout.mutate(plan.id)}
                    disabled={checkout.isPending}
                    className={cn(
                      'w-full py-3 rounded-lg font-bold text-white transition-colors flex items-center justify-center gap-2',
                      planButtonColors[plan.planType as keyof typeof planButtonColors],
                    )}
                  >
                    {checkout.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {plan.trialDays > 0
                      ? `Probar ${plan.trialDays} días gratis`
                      : `Suscribirse por ${formatCurrency(plan.price)}/mes`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-gray-500 text-sm mt-8">
        Todos los planes incluyen acceso inmediato. Sin contratos. Cancela cuando quieras.
      </p>
    </section>
  );
}
