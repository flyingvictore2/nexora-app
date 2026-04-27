'use client';

import { useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface Props {
  plan: {
    id: string;
    name: string;
    price: number;
    trialDays: number;
    planType: string;
  };
  onClose: () => void;
}

type Tab = 'card' | 'paypal';

export function PaymentModal({ plan, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('card');
  const qc = useQueryClient();
  const { currency } = useSiteSettings();

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  // Stripe Checkout (card)
  const stripeMutation = useMutation({
    mutationFn: () => api.post('/payments/checkout', { planId: plan.id }),
    onSuccess: (res) => {
      const url = res.data?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error('No se pudo iniciar el pago con tarjeta');
      }
    },
    onError: () => toast.error('Error al procesar el pago con tarjeta'),
  });

  // PayPal capture
  const captureMutation = useMutation({
    mutationFn: ({ orderID }: { orderID: string }) =>
      api.post('/payments/paypal/capture', { orderID, planId: plan.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-subscription'] });
      toast.success(`¡Plan ${plan.name} activado! 🎉`);
      onClose();
    },
    onError: () => toast.error('Error al confirmar el pago con PayPal'),
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-nexora-dark-2 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-slide-down">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold">Suscribirse a {plan.name}</h2>
            <p className="text-sm text-gray-400">
              {plan.trialDays > 0
                ? `${plan.trialDays} días gratis, luego ${plan.price} ${currency}/mes`
                : `${plan.price} ${currency}/mes`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-white/10">
          <button
            onClick={() => setTab('card')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
              tab === 'card'
                ? 'bg-nexora-red text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10',
            )}
          >
            <CreditCard className="w-4 h-4" />
            Tarjeta de crédito
          </button>
          <button
            onClick={() => setTab('paypal')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
              tab === 'paypal'
                ? 'bg-[#003087] text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10',
            )}
          >
            <PayPalLogo />
            PayPal
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {tab === 'card' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 leading-relaxed">
                Serás redirigido a la pasarela segura de Stripe para completar el pago con tu tarjeta de crédito o débito.
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500 bg-white/5 rounded-lg p-3">
                <span className="text-green-400 text-base">🔒</span>
                <span>Pago 100% seguro. Tu información está cifrada con SSL. No almacenamos datos de tu tarjeta.</span>
              </div>
              <div className="flex gap-2 text-gray-500">
                <span title="Visa">💳</span>
                <span title="Mastercard">💳</span>
                <span title="American Express">💳</span>
                <span className="text-xs self-center ml-1">Visa, Mastercard, Amex y más</span>
              </div>
              <button
                onClick={() => stripeMutation.mutate()}
                disabled={stripeMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-nexora-red hover:bg-nexora-red-dark text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60"
              >
                {stripeMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                {plan.trialDays > 0
                  ? `Probar ${plan.trialDays} días gratis`
                  : `Pagar $${plan.price}/mes`}
              </button>
            </div>
          )}

          {tab === 'paypal' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 leading-relaxed">
                Paga de forma segura con tu cuenta PayPal o con tarjeta a través de PayPal.
              </p>
              {paypalClientId ? (
                <PayPalScriptProvider
                  options={{
                    clientId: paypalClientId,
                    currency: 'USD',
                    intent: 'capture',
                    components: 'buttons',
                    locale: 'es_ES',
                  }}
                >
                  {captureMutation.isPending ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-8 bg-white/5 rounded-xl">
                      <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
                      <p className="text-sm text-gray-400">Confirmando pago con PayPal...</p>
                    </div>
                  ) : (
                    <PayPalButtons
                      style={{
                        layout: 'vertical',
                        color: 'blue',
                        shape: 'rect',
                        label: 'paypal',
                        height: 48,
                      }}
                      createOrder={async () => {
                        try {
                          const res = await api.post('/payments/paypal/create-order', { planId: plan.id });
                          return res.data.data.orderID;
                        } catch {
                          toast.error('Error al iniciar el pago con PayPal');
                          throw new Error('create-order failed');
                        }
                      }}
                      onApprove={async (data) => {
                        captureMutation.mutate({ orderID: data.orderID });
                      }}
                      onError={(err) => {
                        console.error('PayPal error:', err);
                        toast.error('Error en el pago con PayPal');
                      }}
                      onCancel={() => {
                        toast('Pago cancelado', { icon: '⚠️' });
                      }}
                    />
                  )}
                </PayPalScriptProvider>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm bg-white/5 rounded-xl">
                  <p className="text-2xl mb-2">⚙️</p>
                  <p className="font-medium text-gray-400 mb-1">PayPal no configurado</p>
                  <p>Añade <code className="text-xs bg-white/10 px-1 rounded">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> en <code className="text-xs bg-white/10 px-1 rounded">.env.local</code></p>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 pb-4">
          Sin permanencia. Cancela cuando quieras.
        </p>
      </div>
    </div>
  );
}

function PayPalLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
    </svg>
  );
}
