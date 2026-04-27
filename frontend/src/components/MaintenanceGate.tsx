'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState(false);
  const [msg, setMsg] = useState('Estamos realizando tareas de mantenimiento. Volvemos pronto.');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setMaintenance(data?.maintenanceMode ?? false);
        setMsg(data?.maintenanceMsg ?? msg);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAuthRoute = pathname?.startsWith('/auth');

  if (loading) return <>{children}</>;
  if (maintenance && !isAdmin && !isAdminRoute && !isAuthRoute) {
    return (
      <div className="min-h-screen bg-nexora-dark flex flex-col items-center justify-center text-center p-6">
        <div className="text-6xl mb-6">🔧</div>
        <h1 className="text-3xl font-black text-white mb-3">
          <span className="text-nexora-red">NEXORA</span>
        </h1>
        <h2 className="text-xl font-semibold text-white mb-4">Sitio en mantenimiento</h2>
        <p className="text-gray-400 max-w-md leading-relaxed">{msg}</p>
        <p className="text-gray-600 text-sm mt-8">Volvemos pronto ⚡</p>
      </div>
    );
  }

  return <>{children}</>;
}
