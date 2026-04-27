'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Monitor, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success('¡Bienvenido de vuelta!');
      router.push('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-nexora-dark flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/seed/login/1920/1080"
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 px-4 md:px-16 py-6">
        <Link href="/">
          <span className="text-nexora-red font-black text-3xl tracking-widest">NEXORA</span>
        </Link>
      </nav>

      {/* Form */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-black/75 rounded-lg p-8 md:p-12 backdrop-blur-sm">
          <h1 className="text-3xl font-bold mb-8">Iniciar sesión</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register('email')}
                type="email"
                placeholder="Email"
                className="w-full bg-nexora-dark-3 border border-gray-600 rounded px-4 py-4 text-white placeholder-gray-400 focus:border-gray-300 transition-colors"
              />
              {errors.email && <p className="text-nexora-red text-xs mt-1">{errors.email.message}</p>}
            </div>

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
              {errors.password && <p className="text-nexora-red text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-nexora-red hover:bg-nexora-red-dark text-white font-bold py-4 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              Iniciar sesión
            </button>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input {...register('remember')} type="checkbox" className="rounded" />
                Recuérdame
              </label>
              <Link href="/auth/forgot-password" className="text-gray-400 hover:text-white transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>

          <div className="mt-4">
            <div className="relative flex items-center">
              <div className="flex-1 border-t border-gray-600" />
              <span className="px-3 text-gray-400 text-sm">o</span>
              <div className="flex-1 border-t border-gray-600" />
            </div>

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`}
              className="mt-4 w-full flex items-center justify-center gap-3 border border-gray-600 text-white py-3 rounded hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </a>
          </div>

          <p className="mt-8 text-gray-400">
            ¿Nuevo en Nexora?{' '}
            <Link href="/auth/register" className="text-white hover:underline font-medium">
              Regístrate ahora
            </Link>
          </p>

          {/* App download */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center mb-3">Próximamente en</p>
            <div className="flex justify-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 opacity-50 cursor-not-allowed relative">
                <span className="absolute -top-2 -right-1 bg-nexora-red text-white text-[9px] font-bold px-1 py-0.5 rounded-full leading-none">Pronto</span>
                <Monitor className="w-4 h-4 text-gray-300" />
                <span className="text-xs text-gray-300 font-medium">Windows</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 opacity-50 cursor-not-allowed relative">
                <span className="absolute -top-2 -right-1 bg-nexora-red text-white text-[9px] font-bold px-1 py-0.5 rounded-full leading-none">Pronto</span>
                <Smartphone className="w-4 h-4 text-gray-300" />
                <span className="text-xs text-gray-300 font-medium">Android</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
