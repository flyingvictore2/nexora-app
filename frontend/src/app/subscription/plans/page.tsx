'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Zap, Crown, Star } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { useAuthStore } from '@/store/auth.store';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import Link from 'next/link';

const planIcons = { FREE: Star, PREMIUM: Zap, VIP: Crown };
const planColors = {
  FREE: 'border-gray-600',
  PREMIUM: 'border-nexora-red',
  VIP: 'border-yellow-500',
};
const planGlow = {
  FREE: '',
  PREMIUM: 'shadow-[0_0_30px_rgba(229,9,20,0.15)]',
  VIP: 'shadow-[0_0_30px_rgba(234,179,8,0.15)]',
};

export default function PlansPage() {
  const { isAuthenticated } = useAuthStore();
  const { currency } = useSiteSettings();
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => (await api.get('/subscriptions/plans')).data.data,
  });

  const { data: currentSub } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: async () => (await api.get('/subscriptions/my')).data.data,
    enabled: isAuthenticated,
  });

  return (
    <div className="min-h-screen bg-nexora-dark">
      <Navbar />

      <div className="pt-24 px-4 md:px-12 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Elige tu plan <span className="gradient-text">Nexora</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Disfruta de streaming ilimitado de películas, series y anime. Cancela cuando quieras.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-72 h-96 skeleton rounded-xl" />
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
                    planGlow[plan.planType as keyof typeof planGlow],
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
                    <Icon className={cn(
                      'w-12 h-12 mx-auto mb-3',
                      plan.planType === 'VIP' ? 'text-yellow-400' : plan.planType === 'PREMIUM' ? 'text-nexora-red' : 'text-gray-400',
                    )} />
                    <h2 className="text-2xl font-bold">{plan.name}</h2>
                    <div className="mt-3">
                      {plan.price === 0 ? (
                        <span className="text-4xl font-black">Gratis</span>
                      ) : (
                        <>
                          <span className="text-4xl font-black">{formatCurrency(plan.price, currency)}</span>
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
                  <ul className="space-y-2 mb-6">
                    {plan.features?.map((f: string) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <button disabled className="w-full py-3 rounded-lg font-bold bg-green-600/30 text-green-400 cursor-default">
                      Plan actual ✓
                    </button>
                  ) : !isAuthenticated ? (
                    <Link
                      href={`/auth/register?plan=${plan.id}`}
                      className={cn(
                        'block w-full py-3 rounded-lg font-bold text-center text-white transition-colors',
                        plan.planType === 'PREMIUM' ? 'bg-nexora-red hover:bg-nexora-red-dark'
                          : plan.planType === 'VIP' ? 'bg-yellow-600 hover:bg-yellow-500'
                          : 'bg-gray-700 hover:bg-gray-600',
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
                      onClick={() => setSelectedPlan(plan)}
                      className={cn(
                        'w-full py-3 rounded-lg font-bold text-white transition-colors',
                        plan.planType === 'VIP'
                          ? 'bg-yellow-600 hover:bg-yellow-500'
                          : 'bg-nexora-red hover:bg-nexora-red-dark',
                      )}
                    >
                      {plan.trialDays > 0 ? `Probar ${plan.trialDays} días gratis` : `Suscribirse por ${formatCurrency(plan.price, currency)}/mes`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Payment badges */}
        <div className="flex flex-col items-center gap-3 mt-10">
          <p className="text-center text-gray-500 text-sm">
            Todos los planes incluyen acceso inmediato. Sin contratos. Cancela cuando quieras.
          </p>
          <div className="flex items-center gap-4 text-gray-600 text-xs">
            <span className="flex items-center gap-1">🔒 Pago seguro SSL</span>
            <span className="flex items-center gap-1">💳 Visa / Mastercard / Amex</span>
            <span className="flex items-center gap-1">🅿️ PayPal</span>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}
