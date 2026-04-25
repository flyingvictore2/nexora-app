'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(30),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  acceptTerms: z.boolean().refine((v) => v === true, 'Debes aceptar los términos'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const password = watch('password', '');

  const requirements = [
    { label: '8 caracteres mínimo', met: password.length >= 8 },
    { label: 'Una mayúscula', met: /[A-Z]/.test(password) },
    { label: 'Un número', met: /[0-9]/.test(password) },
  ];

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data.email, data.password, data.name);
      toast.success('¡Cuenta creada! Revisa tu email para verificarla.');
      router.push('/profiles');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al registrarse');
    }
  };

  return (
    <div className="min-h-screen bg-nexora-dark flex flex-col">
      <div className="absolute inset-0 z-0">
        <img src="https://picsum.photos/seed/register/1920/1080" alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <nav className="relative z-10 px-4 md:px-16 py-6">
        <Link href="/">
          <span className="text-nexora-red font-black text-3xl tracking-widest">NEXORA</span>
        </Link>
      </nav>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-black/75 rounded-lg p-8 md:p-12 backdrop-blur-sm">
          <h1 className="text-3xl font-bold mb-2">Crear cuenta</h1>
          <p className="text-gray-400 mb-8 text-sm">Únete a la mejor plataforma de streaming</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register('name')}
                placeholder="Tu nombre"
                className="w-full bg-nexora-dark-3 border border-gray-600 rounded px-4 py-4 text-white placeholder-gray-400 focus:border-gray-300 transition-colors"
              />
              {errors.name && <p className="text-nexora-red text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <input
                {...register('email')}
                type="email"
                placeholder="Email"
                className="w-full bg-nexora-dark-3 border border-gray-600 rounded px-4 py-4 text-white placeholder-gray-400 focus:border-gray-300 transition-colors"
              />
              {errors.email && <p className="text-nexora-red text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  className="w-full bg-nexora-dark-3 border border-gray-600 rounded px-4 py-4 text-white placeholder-gray-400 focus:border-gray-300 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Requirements */}
              {password && (
                <div className="mt-2 space-y-1">
                  {requirements.map((req) => (
                    <div key={req.label} className="flex items-center gap-2 text-xs">
                      <Check className={`w-3 h-3 ${req.met ? 'text-green-400' : 'text-gray-500'}`} />
                      <span className={req.met ? 'text-green-400' : 'text-gray-500'}>{req.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-nexora-red text-xs mt-1">{errors.password.message}</p>}
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input {...register('acceptTerms')} type="checkbox" className="mt-1 rounded" />
              <span className="text-gray-400 text-xs">
                Acepto los{' '}
                <Link href="#" className="text-white hover:underline">Términos de servicio</Link>
                {' '}y la{' '}
                <Link href="#" className="text-white hover:underline">Política de privacidad</Link>
              </span>
            </label>
            {errors.acceptTerms && <p className="text-nexora-red text-xs">{errors.acceptTerms.message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-nexora-red hover:bg-nexora-red-dark text-white font-bold py-4 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              Crear cuenta gratis
            </button>
          </form>

          <p className="mt-6 text-gray-400 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-white hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
