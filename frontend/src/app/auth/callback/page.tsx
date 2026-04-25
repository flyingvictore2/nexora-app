'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      Cookies.set('accessToken', accessToken, { expires: 1 });
      Cookies.set('refreshToken', refreshToken, { expires: 7 });
      router.push('/profiles');
    } else {
      router.push('/auth/login?error=oauth_failed');
    }
  }, []);

  return (
    <div className="min-h-screen bg-nexora-dark flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-nexora-red animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Iniciando sesión...</p>
      </div>
    </div>
  );
}
