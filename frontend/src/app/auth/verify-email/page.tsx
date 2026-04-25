'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }

    api.post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
        setTimeout(() => router.push('/auth/login'), 3000);
      })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-nexora-dark flex flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8">
        <span className="text-nexora-red font-black text-3xl tracking-widest">NEXORA</span>
      </Link>

      <div className="w-full max-w-md bg-nexora-dark-2 border border-white/10 rounded-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-nexora-red mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold">Verificando tu email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">¡Email verificado!</h2>
            <p className="text-gray-400 mb-4">Tu cuenta está activa. Redirigiendo al inicio de sesión...</p>
            <Link href="/auth/login" className="text-nexora-red hover:underline">
              Ir al inicio de sesión
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Token inválido o expirado</h2>
            <p className="text-gray-400 mb-4">El enlace de verificación no es válido.</p>
            <Link href="/auth/login" className="text-nexora-red hover:underline">
              Volver al inicio de sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
