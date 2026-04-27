'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const SUGGESTIONS = [
  '¿Qué me recomiendas ver hoy?',
  'Quiero una película de terror',
  'Serie para ver en familia',
  'Algo de acción y aventuras',
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput('');

    const newMessages: Message[] = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: msg,
        history: messages,
      });
      setMessages([...newMessages, { role: 'model', content: res.data.data?.reply ?? res.data?.reply }]);
    } catch (err: any) {
      const detail = err?.response?.data?.message ?? err?.message ?? 'Error desconocido';
      setMessages([...newMessages, {
        role: 'model',
        content: `Error: ${detail} 😓`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-nexora-red shadow-lg flex items-center justify-center hover:bg-red-700 transition-colors ${open ? 'hidden' : 'flex'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Asistente Nex"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-5rem)] flex flex-col bg-nexora-dark-2 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-nexora-dark border-b border-white/10 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-nexora-red flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Nex</p>
                <p className="text-xs text-gray-400">Asistente de Nexora</p>
              </div>
              <button
                onClick={() => { setMessages([]); }}
                className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                title="Limpiar chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center text-center pt-4">
                  <div className="w-14 h-14 rounded-full bg-nexora-red/20 flex items-center justify-center mb-3">
                    <Sparkles className="w-7 h-7 text-nexora-red" />
                  </div>
                  <p className="font-semibold mb-1">¡Hola! Soy Nex 👋</p>
                  <p className="text-gray-400 text-sm mb-5">Tu asistente personal de Nexora. Puedo recomendarte películas, series y ayudarte a encontrar qué ver.</p>
                  <div className="flex flex-col gap-2 w-full">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-left text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'model' && (
                        <div className="w-6 h-6 rounded-full bg-nexora-red flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-nexora-red text-white rounded-br-sm'
                            : 'bg-white/8 text-gray-100 rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="w-6 h-6 rounded-full bg-nexora-red flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-white/8 rounded-2xl rounded-bl-sm">
                        <TypingDots />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-3 border-t border-white/10 flex-shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Pregúntame algo…"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-nexora-red transition-colors placeholder-gray-500"
                disabled={loading}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-nexora-red hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
