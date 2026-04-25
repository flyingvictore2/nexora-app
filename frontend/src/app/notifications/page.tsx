'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Bell, CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  useNotifications,
  useMarkAllRead,
  useMarkRead,
  useDeleteNotification,
} from '@/hooks/useNotifications';

const typeIcon: Record<string, string> = {
  subscription: '💳',
  content: '🎬',
  system: '🔔',
  payment: '💰',
  welcome: '🎉',
};

export default function NotificationsPage() {
  const { data: notifications = [], isLoading, refetch, isFetching } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markRead = useMarkRead();
  const deleteNotif = useDeleteNotification();

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-nexora-dark">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-16 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="w-7 h-7 text-nexora-red" />
            <h1 className="text-3xl font-bold">Notificaciones</h1>
            {unreadCount > 0 && (
              <span className="bg-nexora-red text-white text-xs px-2 py-0.5 rounded-full font-medium">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Actualizar"
            >
              <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            </button>

            {/* Mark all read */}
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Marcar todas
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 skeleton rounded-xl" />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n: any) => (
              <div
                key={n.id}
                className={cn(
                  'group flex items-start gap-4 p-4 rounded-xl border transition-colors',
                  n.isRead
                    ? 'bg-nexora-dark-2 border-white/5'
                    : 'bg-nexora-dark-3 border-nexora-red/30 cursor-pointer hover:border-nexora-red/50',
                )}
                onClick={() => !n.isRead && markRead.mutate(n.id)}
              >
                {/* Icon */}
                <span className="text-2xl flex-shrink-0 mt-0.5 select-none">
                  {typeIcon[n.type] || '🔔'}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-semibold', n.isRead ? 'text-gray-300' : 'text-white')}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(n.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-nexora-red rounded-full" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotif.mutate(n.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Bell className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">Sin notificaciones</p>
            <p className="text-gray-400 text-sm">Te avisaremos cuando haya novedades</p>
          </div>
        )}
      </div>
    </div>
  );
}
