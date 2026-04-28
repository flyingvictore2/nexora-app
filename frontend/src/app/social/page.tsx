'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Users, UserPlus, Search, Check, X, UserMinus, Clock, Popcorn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useFriends, usePendingRequests, useSearchUsers,
  useSendFriendRequest, useAcceptRequest, useRejectRequest, useRemoveFriend,
} from '@/hooks/useFriends';
import Link from 'next/link';

function Avatar({ user, size = 10 }: { user: any; size?: number }) {
  const s = `w-${size} h-${size}`;
  if (user?.avatar) return <img src={user.avatar} className={`${s} rounded-full object-cover`} alt={user.name} />;
  return (
    <div className={`${s} rounded-full bg-nexora-red flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
      {(user?.name || user?.email || '?')[0].toUpperCase()}
    </div>
  );
}

function SearchTab() {
  const [q, setQ] = useState('');
  const { data: results } = useSearchUsers(q);
  const { mutate: sendRequest, isPending } = useSendFriendRequest();

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o email…"
          className="w-full bg-nexora-dark-3 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-nexora-red transition-colors"
        />
      </div>
      <div className="space-y-3">
        {results?.map((user: any) => (
          <div key={user.id} className="flex items-center gap-3 bg-nexora-dark-2 rounded-xl p-3">
            <Avatar user={user} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name || 'Usuario'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => sendRequest(user.id)}
              disabled={isPending}
              className="flex items-center gap-1.5 bg-nexora-red hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" /> Añadir
            </button>
          </div>
        ))}
        {q.length >= 2 && results?.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No se encontraron usuarios</p>
        )}
        {q.length < 2 && (
          <p className="text-center text-gray-500 text-sm py-8">Escribe al menos 2 caracteres para buscar</p>
        )}
      </div>
    </div>
  );
}

function RequestsTab() {
  const { data: requests } = usePendingRequests();
  const { mutate: accept } = useAcceptRequest();
  const { mutate: reject } = useRejectRequest();

  if (!requests?.length) return (
    <div className="text-center py-16 text-gray-400">
      <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>No tienes solicitudes pendientes</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {requests.map((req: any) => (
        <div key={req.id} className="flex items-center gap-3 bg-nexora-dark-2 rounded-xl p-3">
          <Avatar user={req.sender} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{req.sender?.name || 'Usuario'}</p>
            <p className="text-xs text-gray-400 truncate">{req.sender?.email}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => accept(req.id)}
              className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => reject(req.id)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function FriendsTab() {
  const { data: friends } = useFriends();
  const { mutate: remove } = useRemoveFriend();

  if (!friends?.length) return (
    <div className="text-center py-16 text-gray-400">
      <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="mb-2">Aún no tienes amigos en Nexora</p>
      <p className="text-sm">Búscalos en la pestaña Buscar</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {friends.map((f: any) => (
        <div key={f.friendshipId} className="flex items-center gap-3 bg-nexora-dark-2 rounded-xl p-3">
          <Avatar user={f.friend} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{f.friend?.name || 'Usuario'}</p>
            <p className="text-xs text-gray-400 truncate">{f.friend?.email}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/browse`}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded-lg transition-colors"
              title="Crear Watch Party"
            >
              <Popcorn className="w-3.5 h-3.5" /> Ver juntos
            </Link>
            <button
              onClick={() => { if (confirm('¿Eliminar amigo?')) remove(f.friend.id); }}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors text-gray-400 hover:text-red-400"
            >
              <UserMinus className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { id: 'friends', label: 'Amigos', icon: Users },
  { id: 'requests', label: 'Solicitudes', icon: Clock },
  { id: 'search', label: 'Buscar', icon: Search },
];

export default function SocialPage() {
  const [tab, setTab] = useState('friends');
  const { data: requests } = usePendingRequests();
  const pendingCount = requests?.length ?? 0;

  return (
    <div className="min-h-screen bg-nexora-dark">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-16 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-7 h-7 text-nexora-red" />
          <h1 className="text-3xl font-bold">Social</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-nexora-dark-2 rounded-xl p-1 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                tab === t.id ? 'bg-nexora-red text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.id === 'requests' && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-nexora-red text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-nexora-dark">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {tab === 'friends' && <FriendsTab />}
            {tab === 'requests' && <RequestsTab />}
            {tab === 'search' && <SearchTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
