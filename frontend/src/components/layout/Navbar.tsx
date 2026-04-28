'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, ChevronDown, Sun, Moon, Settings, LogOut, User, CheckCheck, Trash2, ArrowRight, Download, X, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import {
  useNotifications,
  useUnreadCount,
  useMarkAllRead,
  useMarkRead,
  useDeleteNotification,
} from '@/hooks/useNotifications';
import { cn, formatDate } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const typeIcon: Record<string, string> = {
  subscription: '💳',
  content: '🎬',
  system: '🔔',
  payment: '💰',
  welcome: '🎉',
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileMenu, setProfileMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Search history helpers
  const getHistory = (): string[] => {
    try { return JSON.parse(localStorage.getItem('nexora-search-history') || '[]'); } catch { return []; }
  };
  const addToHistory = (q: string) => {
    const prev = getHistory().filter((h) => h !== q);
    localStorage.setItem('nexora-search-history', JSON.stringify([q, ...prev].slice(0, 8)));
  };
  const removeFromHistory = (q: string) => {
    localStorage.setItem('nexora-search-history', JSON.stringify(getHistory().filter((h) => h !== q)));
  };
  const clearHistory = () => localStorage.removeItem('nexora-search-history');

  const { user, activeProfile, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const pathname = usePathname();
  const { isHidden } = useSiteSettings();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: notifications = [] } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markRead = useMarkRead();
  const deleteNotif = useDeleteNotification();

  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToHistory(searchQuery.trim());
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setShowHistory(false);
    }
  };

  const handleHistoryClick = (q: string) => {
    addToHistory(q);
    router.push(`/browse?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSearchQuery('');
    setShowHistory(false);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-12 py-4',
        scrolled ? 'bg-nexora-dark shadow-xl' : 'bg-gradient-to-b from-black/80 to-transparent',
      )}
    >
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex-shrink-0">
            <span className="text-nexora-red font-black text-2xl md:text-3xl tracking-widest">
              NEXORA
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {!isHidden('browse') && (
              <Link href="/" className={cn('text-sm transition-colors', pathname === '/' ? 'text-white font-medium' : 'text-gray-300 hover:text-white')}>
                Inicio
              </Link>
            )}
            {user && (
              <>
                {!isHidden('browse') && (
                  <>
                    <Link href="/browse?type=SERIES" className={cn('text-sm transition-colors', pathname === '/browse' ? 'text-white font-medium' : 'text-gray-300 hover:text-white')}>
                      Series
                    </Link>
                    <Link href="/browse?type=MOVIE" className={cn('text-sm transition-colors', pathname === '/browse' ? 'text-white font-medium' : 'text-gray-300 hover:text-white')}>
                      Películas
                    </Link>
                    <Link href="/browse?type=ANIME" className={cn('text-sm transition-colors', pathname === '/browse' ? 'text-white font-medium' : 'text-gray-300 hover:text-white')}>
                      Anime
                    </Link>
                    <Link href="/my-list" className={cn('text-sm transition-colors', pathname === '/my-list' ? 'text-white font-medium' : 'text-gray-300 hover:text-white')}>
                      Mi Lista
                    </Link>
                    <Link href="/social" className={cn('text-sm transition-colors', pathname === '/social' ? 'text-white font-medium' : 'text-gray-300 hover:text-white')}>
                      Social
                    </Link>
                    <Link href="/downloads" className={cn('text-sm transition-colors', pathname === '/downloads' ? 'text-white font-medium' : 'text-gray-300 hover:text-white')}>
                      Descargas
                    </Link>
                  </>
                )}
                {!isHidden('new') && (
                  <Link href="/browse/new" className={cn('text-sm transition-colors', pathname === '/browse/new' ? 'text-white font-medium' : 'text-gray-300 hover:text-white')}>
                    Novedades
                  </Link>
                )}
                {!isHidden('requests') && (
                  <Link href="/requests" className={cn('text-sm transition-colors', pathname === '/requests' ? 'text-white font-medium' : 'text-gray-300 hover:text-white')}>
                    Solicitudes
                  </Link>
                )}
                {!isHidden('support') && (
                  <Link href="/support" className={cn('text-sm transition-colors', pathname === '/support' ? 'text-white font-medium' : 'text-gray-300 hover:text-white')}>
                    Soporte
                  </Link>
                )}
              </>
            )}
            {!isHidden('plans') && (
              <Link href="/subscription/plans" className={cn('text-sm transition-colors', pathname === '/subscription/plans' ? 'text-white font-medium' : 'text-gray-300 hover:text-white')}>
                Planes
              </Link>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Search */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <div className="relative">
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowHistory(true); }}
                    onFocus={() => setShowHistory(true)}
                    onBlur={() => setTimeout(() => setShowHistory(false), 150)}
                    placeholder="Buscar títulos, géneros..."
                    className="bg-black/80 border border-white/30 text-white text-sm px-4 py-2 w-48 md:w-64 rounded-sm"
                  />
                </form>
                {/* History dropdown */}
                {showHistory && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-nexora-dark-2 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                    {getHistory().length > 0 ? (
                      <>
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
                          <span className="text-xs text-gray-500">Búsquedas recientes</span>
                          <button onClick={clearHistory} className="text-[10px] text-gray-500 hover:text-white">Limpiar</button>
                        </div>
                        {getHistory()
                          .filter((h) => !searchQuery || h.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((h) => (
                            <div key={h} className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 cursor-pointer group">
                              <Clock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                              <span className="flex-1 text-sm text-gray-300 truncate" onClick={() => handleHistoryClick(h)}>{h}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeFromHistory(h); setShowHistory(false); setTimeout(() => setShowHistory(true), 10); }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-600 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                      </>
                    ) : searchQuery.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-3">Sin búsquedas recientes</p>
                    ) : null}
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-1 text-white hover:text-gray-300">
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="p-1 text-white hover:text-gray-300 hidden md:block">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <>
              {/* Notifications dropdown */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setProfileMenu(false); }}
                  className="relative p-1 text-white hover:text-gray-300"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-nexora-red text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-nexora-dark-2 border border-white/10 rounded-xl shadow-2xl animate-slide-down overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <span className="font-semibold text-sm">Notificaciones</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllRead.mutate()}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Marcar todas
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center text-gray-500 text-sm">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          Sin notificaciones
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n: any) => (
                          <div
                            key={n.id}
                            className={cn(
                              'group flex items-start gap-3 px-4 py-3 border-b border-white/5 transition-colors',
                              !n.isRead
                                ? 'bg-white/5 cursor-pointer hover:bg-white/10'
                                : 'hover:bg-white/5',
                            )}
                            onClick={() => !n.isRead && markRead.mutate(n.id)}
                          >
                            <span className="text-lg flex-shrink-0 mt-0.5 select-none">
                              {typeIcon[n.type] || '🔔'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-xs font-semibold leading-snug', n.isRead ? 'text-gray-300' : 'text-white')}>
                                {n.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                              <p className="text-[10px] text-gray-600 mt-1">{formatDate(n.createdAt)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              {!n.isRead && (
                                <div className="w-1.5 h-1.5 bg-nexora-red rounded-full mt-1" />
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(n.id); }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-600 hover:text-red-400 transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer — ver todas */}
                    <Link
                      href="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors border-t border-white/10"
                    >
                      Ver todas las notificaciones
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Profile menu */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => { setProfileMenu(!profileMenu); setNotifOpen(false); }}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded overflow-hidden border-2 border-transparent group-hover:border-white transition-colors">
                    {activeProfile?.avatar ? (
                      <img src={activeProfile.avatar} alt={activeProfile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-nexora-red flex items-center justify-center text-sm font-bold">
                        {activeProfile?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <ChevronDown className={cn('w-4 h-4 hidden md:block transition-transform', profileMenu && 'rotate-180')} />
                </button>

                {profileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-nexora-dark-2 border border-white/10 rounded shadow-2xl animate-slide-down">
                    <div className="p-3 border-b border-white/10">
                      <p className="text-sm font-medium">{activeProfile?.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>

                    <div className="p-1">
                      <Link
                        href="/profiles"
                        className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 rounded"
                        onClick={() => setProfileMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        Cambiar perfil
                      </Link>
                      <Link
                        href="/downloads"
                        className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 rounded"
                        onClick={() => setProfileMenu(false)}
                      >
                        <Download className="w-4 h-4" />
                        Mis descargas
                      </Link>
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 rounded"
                        onClick={() => setProfileMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Configuración
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 rounded text-nexora-red"
                          onClick={() => setProfileMenu(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Panel Admin
                        </Link>
                      )}
                    </div>

                    <div className="p-1 border-t border-white/10">
                      <button
                        onClick={() => { setProfileMenu(false); logout(); router.push('/auth/login'); }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 rounded"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="bg-nexora-red hover:bg-nexora-red-dark text-white text-sm font-medium px-4 py-2 rounded transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
