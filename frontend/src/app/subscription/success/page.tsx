'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'loading' | 'success' | 'already' | 'error'>('loading');
  const [planName, setPlanName] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('success'); // came from PayPal or direct, no session to verify
      return;
    }

    api.post('/payments/stripe/verify-session', { sessionId })
      .then((res) => {
        const data = res.data?.data;
        if (data?.alreadyProcessed) {
          setStatus('already');
        } else {
          setPlanName(data?.planName || '');
          setStatus('success');
          // Invalidate cached subscription & notifications
          qc.invalidateQueries({ queryKey: ['my-subscription'] });
          qc.invalidateQueries({ queryKey: ['notifications'] });
          qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        }
      })
      .catch(() => setStatus('error'));
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-nexora-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-14 h-14 text-nexora-red animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Confirmando tu pago...</p>
          <p className="text-gray-600 text-sm mt-1">Esto solo tarda unos segundos</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-nexora-dark flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-14 h-14 text-red-400" />
          </div>
          <h1 className="text-3xl font-black mb-3">Error al confirmar</h1>
          <p className="text-gray-400 mb-8">
            No hemos podido confirmar tu pago automáticamente. Si el cargo se realizó correctamente,
            contacta con soporte con tu <code className="text-xs bg-white/10 px-1 rounded">session_id</code> de Stripe.
          </p>
          <Link
            href="/subscription/plans"
            className="inline-flex items-center gap-2 bg-nexora-red hover:bg-nexora-red-dark text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Volver a planes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nexora-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon with animation */}
        <div className="w-28 h-28 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
          <CheckCircle className="w-16 h-16 text-green-400" />
        </div>

        <h1 className="text-3xl font-black mb-2">¡Suscripción activada!</h1>
        {planName && (
          <p className="text-nexora-red font-bold text-lg mb-3">Plan {planName}</p>
        )}
        <p className="text-gray-400 mb-8 leading-relaxed">
          {status === 'already'
            ? 'Tu suscripción ya estaba activa. Disfruta del contenido.'
            : 'Tu pago fue procesado. Tienes acceso completo a todo el catálogo de Nexora.'}
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-nexora-red hover:bg-nexora-red-dark text-white font-bold py-3.5 px-6 rounded-lg transition-colors w-full"
          >
            Empezar a ver ahora
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/account"
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg transition-colors w-full text-sm"
          >
            Ver mi suscripción
          </Link>
        </div>

        <p className="text-gray-500 text-xs mt-6">
          Recibirás un email de confirmación en tu bandeja de entrada.
        </p>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-nexora-dark flex items-center justify-center"><Loader2 className="w-12 h-12 text-nexora-red animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
