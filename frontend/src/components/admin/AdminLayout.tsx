'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Film, Users, CreditCard, BarChart2,
  Settings, LogOut, Menu, X, ChevronRight, Bell,
  Inbox, HeadphonesIcon, Tag,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/content', label: 'Contenido', icon: Film },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/analytics', label: 'Analíticas', icon: BarChart2 },
  { href: '/admin/subscriptions', label: 'Suscripciones', icon: CreditCard },
  { href: '/admin/coupons', label: 'Cupones', icon: Tag },
  { href: '/admin/requests', label: 'Solicitudes', icon: Inbox },
  { href: '/admin/support', label: 'Soporte', icon: HeadphonesIcon },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-nexora-dark flex">
      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-nexora-dark-2 border-r border-white/10 transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Link href="/">
            <span className="text-nexora-red font-black text-xl tracking-widest">NEXORA</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 py-2 border-b border-white/10">
          <div className="px-3 py-2 flex items-center gap-2">
            <div className="w-8 h-8 bg-nexora-red rounded-full flex items-center justify-center text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{user?.email}</p>
              <p className="text-[10px] text-nexora-red uppercase font-medium">Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group',
                  active ? 'bg-nexora-red/20 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white',
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {active && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 text-sm">
            <LayoutDashboard className="w-5 h-5" />
            Ver sitio
          </Link>
          <button
            onClick={async () => { await logout(); router.push('/auth/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 text-sm"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-nexora-dark border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1">
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden md:block">
            <h2 className="text-sm font-medium text-gray-400">
              Panel de Administración
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
