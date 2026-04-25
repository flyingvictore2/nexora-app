'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm<{ email: string }>();

  const onSubmit = async ({ email }: { email: string }) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Error al enviar el email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nexora-dark flex flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8">
        <span className="text-nexora-red font-black text-3xl tracking-widest">NEXORA</span>
      </Link>

      <div className="w-full max-w-md bg-nexora-dark-2 border border-white/10 rounded-lg p-8">
        {sent ? (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Email enviado</h2>
            <p className="text-gray-400 mb-6">Revisa tu bandeja de entrada para el enlace de recuperación.</p>
            <Link href="/auth/login" className="text-nexora-red hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">Olvidé mi contraseña</h1>
            <p className="text-gray-400 mb-6 text-sm">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input
                {...register('email', { required: true })}
                type="email"
                placeholder="Tu email"
                className="w-full bg-nexora-dark-3 border border-gray-600 rounded px-4 py-4 text-white placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-nexora-red hover:bg-nexora-red-dark text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                Enviar enlace
              </button>
            </form>
            <p className="mt-4 text-center">
              <Link href="/auth/login" className="text-gray-400 hover:text-white text-sm">
                Volver al inicio de sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
