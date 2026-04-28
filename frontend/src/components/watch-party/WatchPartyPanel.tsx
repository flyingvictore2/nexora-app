'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import {
  Popcorn, X, Copy, Check, Users, Send, Crown,
  LogIn, Plus, Loader2, MessageCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

interface WatchPartyPanelProps {
  contentId: string;
  episodeId?: string;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onPlayPause: (playing: boolean) => void;
}

function Avatar({ user, size = 8 }: { user: any; size?: number }) {
  const s = `w-${size} h-${size}`;
  if (user?.avatar) return <img src={user.avatar} className={`${s} rounded-full object-cover`} alt={user.name} />;
  return (
    <div className={`${s} rounded-full bg-nexora-red flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
      {(user?.name || user?.email || '?')[0].toUpperCase()}
    </div>
  );
}

export function WatchPartyPanel({
  contentId, episodeId, currentTime, isPlaying, onSeek, onPlayPause,
}: WatchPartyPanelProps) {
  const [open, setOpen] = useState(false);
  const [party, setParty] = useState<any>(null);
  const [joinCode, setJoinCode] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isHostRef = useRef(false);
  const ignoreNextSync = useRef(false);

  const { user } = useAuthStore();

  const connectSocket = useCallback((partyId: string) => {
    const token = Cookies.get('accessToken');
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? '';

    const socket = io(`${backendUrl}/watch-party`, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('join-party', { partyId });
    });

    socket.on('party-state', (data: any) => {
      setMessages(data?.messages ?? []);
      setMembers(data?.members ?? []);
    });

    socket.on('member-joined', () => {
      // Refresh members
      api.get(`/watch-party/${partyId}`).then((r) => setMembers(r.data.data?.members ?? []));
    });

    socket.on('member-left', () => {
      api.get(`/watch-party/${partyId}`).then((r) => setMembers(r.data.data?.members ?? []));
    });

    socket.on('playback-sync', (data: { position: number; isPlaying: boolean }) => {
      if (isHostRef.current) return; // Host doesn't need to sync from others
      ignoreNextSync.current = true;
      onSeek(data.position);
      onPlayPause(data.isPlaying);
    });

    socket.on('new-message', (msg: any) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });

    socketRef.current = socket;
  }, [onSeek, onPlayPause]);

  // Emit playback changes if host
  useEffect(() => {
    if (!party || !isHostRef.current || !socketRef.current) return;
    if (ignoreNextSync.current) { ignoreNextSync.current = false; return; }
    socketRef.current.emit('playback-update', {
      partyId: party.id,
      position: currentTime,
      isPlaying,
    });
  }, [isPlaying, Math.floor(currentTime / 5)]); // throttle: emit every 5s or on play/pause

  const createParty = async () => {
    setLoading(true);
    try {
      const res = await api.post('/watch-party', { contentId, episodeId });
      const p = res.data.data;
      isHostRef.current = true;
      setParty(p);
      setMembers(p.members ?? []);
      setMessages(p.messages ?? []);
      connectSocket(p.id);
      toast.success('¡Sala creada!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Error al crear sala');
    } finally {
      setLoading(false);
    }
  };

  const joinParty = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/watch-party/join/${joinCode.trim().toUpperCase()}`);
      const p = res.data.data;
      isHostRef.current = p.hostId === user?.id;
      setParty(p);
      setMembers(p.members ?? []);
      setMessages(p.messages ?? []);
      connectSocket(p.id);
      // Sync to host's position
      onSeek(p.position ?? 0);
      onPlayPause(p.isPlaying ?? false);
      toast.success('¡Te has unido a la sala!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current || !party) return;
    socketRef.current.emit('send-message', { partyId: party.id, message: message.trim() });
    setMessage('');
  };

  const leaveParty = () => {
    if (socketRef.current && party) {
      socketRef.current.emit('leave-party', { partyId: party.id });
      socketRef.current.disconnect();
    }
    setParty(null);
    setMessages([]);
    setMembers([]);
    socketRef.current = null;
    toast('Has salido de la sala');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(party.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => { socketRef.current?.disconnect(); };
  }, []);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        <Popcorn className="w-4 h-4" />
        Ver juntos
        {party && <span className="w-2 h-2 bg-green-400 rounded-full" />}
      </button>

      {/* Side panel */}
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-nexora-dark border-l border-white/10 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Popcorn className="w-5 h-5 text-nexora-red" />
                  <span className="font-semibold">Watch Party</span>
                  {party && <span className="w-2 h-2 bg-green-400 rounded-full" />}
                </div>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!party ? (
                /* No party — create or join */
                <div className="flex-1 flex flex-col justify-center px-6 gap-6">
                  <div className="text-center mb-2">
                    <Popcorn className="w-12 h-12 text-nexora-red mx-auto mb-3 opacity-70" />
                    <p className="font-semibold text-lg">¿Ver juntos?</p>
                    <p className="text-gray-400 text-sm mt-1">Crea una sala o únete con un código</p>
                  </div>

                  <button
                    onClick={createParty}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-nexora-red hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Crear sala
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-gray-500 text-xs">o</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && joinParty()}
                      placeholder="Código de sala…"
                      maxLength={6}
                      className="flex-1 bg-nexora-dark-3 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-nexora-red transition-colors uppercase tracking-widest"
                    />
                    <button
                      onClick={joinParty}
                      disabled={loading || joinCode.length < 6}
                      className="bg-white/10 hover:bg-white/20 disabled:opacity-40 px-3 rounded-xl transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* In party */
                <>
                  {/* Code + members */}
                  <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-400">Código de sala</p>
                        <p className="text-xl font-black tracking-widest text-nexora-red">{party.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={copyCode}
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                          title="Copiar código"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={leaveParty}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-colors text-gray-400"
                          title="Salir"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Members */}
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-400">{members.length} viendo</span>
                      <div className="flex -space-x-2 ml-2">
                        {members.slice(0, 5).map((m: any) => (
                          <div key={m.id} className="relative" title={m.user?.name}>
                            <Avatar user={m.user} size={7} />
                            {m.user?.id === party.hostId && (
                              <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
                            )}
                          </div>
                        ))}
                      </div>
                      {isHostRef.current && (
                        <span className="ml-auto text-xs text-yellow-400 flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Host
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Chat */}
                  <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 text-xs">El chat está vacío. ¡Di algo!</p>
                      </div>
                    ) : (
                      messages.map((msg: any, i: number) => {
                        const isMe = msg.user?.id === user?.id || msg.userId === user?.id;
                        return (
                          <div key={msg.id ?? i} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <Avatar user={msg.user} size={7} />
                            <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                              {!isMe && (
                                <span className="text-[10px] text-gray-500">{msg.user?.name || 'Usuario'}</span>
                              )}
                              <div className={`rounded-2xl px-3 py-2 text-sm ${isMe ? 'bg-nexora-red text-white rounded-br-sm' : 'bg-white/8 rounded-bl-sm'}`}>
                                {msg.message}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message input */}
                  <div className="flex items-center gap-2 px-3 py-3 border-t border-white/10 flex-shrink-0">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                      placeholder="Mensaje…"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-nexora-red transition-colors"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!message.trim()}
                      className="w-8 h-8 rounded-xl bg-nexora-red hover:bg-red-700 disabled:opacity-40 flex items-center justify-center transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
