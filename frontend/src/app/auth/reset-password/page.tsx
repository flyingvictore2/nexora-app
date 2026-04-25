'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';

const schema = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Las contraseñas no coinciden', path: ['confirm'] });

type FormData = z.infer<typeof schema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const token = searchParams.get('token');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ password }: FormData) => {
    if (!token) { toast.error('Token inválido'); return; }
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Token inválido o expirado');
    }
  };

  return (
    <div className="w-full max-w-md bg-nexora-dark-2 border border-white/10 rounded-lg p-8">
      {done ? (
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">¡Contraseña restablecida!</h2>
          <p className="text-gray-400 mb-4">Redirigiendo al inicio de sesión...</p>
          <Link href="/auth/login" className="text-nexora-red hover:underline">Ir ahora</Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-6">Nueva contraseña</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <input
                {...register('password')}
                type={showPw ? 'text' : 'password'}
                placeholder="Nueva contraseña"
                className="w-full bg-nexora-dark-3 border border-gray-600 rounded px-4 py-4 text-white pr-12"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <input {...register('confirm')} type="password" placeholder="Confirmar contraseña"
                className="w-full bg-nexora-dark-3 border border-gray-600 rounded px-4 py-4 text-white" />
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-nexora-red hover:bg-nexora-red-dark text-white font-bold py-3 rounded flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              Restablecer contraseña
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-nexora-dark flex flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8">
        <span className="text-nexora-red font-black text-3xl tracking-widest">NEXORA</span>
      </Link>
      <Suspense fallback={<Loader2 className="w-8 h-8 text-nexora-red animate-spin" />}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
