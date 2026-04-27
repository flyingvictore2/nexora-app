'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ContentCard } from '@/components/content/ContentCard';
import {
  List, Plus, Loader2, MoreHorizontal, Pencil, Trash2, X, Check, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLists, useCreateList, useDeleteList, useUpdateList } from '@/hooks/useLists';
import Link from 'next/link';

/* ─── Create-list modal ─────────────────────────────────────── */
function CreateListModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📋');
  const { mutate: createList, isPending } = useCreateList();

  const EMOJIS = ['📋', '⭐', '🎬', '🍿', '❤️', '🔥', '🎭', '🎥', '📺', '🌟', '💡', '🎞️'];

  const submit = () => {
    if (!name.trim()) return;
    createList({ name: name.trim(), emoji }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-nexora-dark-2 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Nueva lista</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emoji picker */}
        <p className="text-xs text-gray-400 mb-2">Elige un emoji</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                emoji === e ? 'bg-nexora-red' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Name input */}
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Nombre de la lista…"
          maxLength={50}
          className="w-full bg-nexora-dark-3 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-nexora-red transition-colors mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!name.trim() || isPending}
            className="px-5 py-2 rounded-lg text-sm bg-nexora-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Crear lista
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── List card ─────────────────────────────────────────────── */
function ListCard({ list }: { list: any }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(list.name);
  const { mutate: deleteList } = useDeleteList();
  const { mutate: updateList, isPending: saving } = useUpdateList();

  const saveEdit = () => {
    if (!editName.trim() || editName === list.name) { setEditing(false); return; }
    updateList({ id: list.id, name: editName.trim() }, { onSuccess: () => setEditing(false) });
  };

  const previewItems = list.items?.slice(0, 4) ?? [];
  const count = list._count?.items ?? list.items?.length ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-nexora-dark-2 border border-white/8 rounded-xl overflow-hidden group"
    >
      {/* Preview grid */}
      <Link href={`/my-list/${list.id}`} className="block">
        <div className="grid grid-cols-2 gap-0.5 aspect-video bg-nexora-dark-3">
          {previewItems.length === 0 ? (
            <div className="col-span-2 row-span-2 flex items-center justify-center">
              <span className="text-5xl opacity-40">{list.emoji}</span>
            </div>
          ) : (
            previewItems.map((item: any, i: number) => (
              <div key={item.id ?? i} className="relative overflow-hidden bg-nexora-dark-3">
                {item.content?.posterUrl ? (
                  <img
                    src={item.content.posterUrl}
                    alt={item.content.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-600 text-xs text-center px-1">{item.content?.title}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Link>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center gap-2">
        <span className="text-xl">{list.emoji}</span>

        {editing ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false); }}
            className="flex-1 bg-nexora-dark-3 border border-nexora-red rounded px-2 py-0.5 text-sm outline-none"
          />
        ) : (
          <Link href={`/my-list/${list.id}`} className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{list.name}</p>
            <p className="text-gray-500 text-xs">{count} título{count !== 1 ? 's' : ''}</p>
          </Link>
        )}

        {editing ? (
          <div className="flex gap-1">
            <button onClick={saveEdit} disabled={saving} className="text-green-400 hover:text-green-300">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
            <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
              className="text-gray-500 hover:text-white transition-colors p-1 rounded"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-0 bottom-8 z-20 bg-nexora-dark border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px]"
                  >
                    <button
                      onClick={() => { setEditing(true); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 text-left"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Renombrar
                    </button>
                    <button
                      onClick={() => { if (confirm(`¿Eliminar "${list.name}"?`)) deleteList(list.id); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 text-red-400 text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function MyListPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: lists, isLoading } = useLists();

  return (
    <div className="min-h-screen bg-nexora-dark">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <List className="w-7 h-7 text-nexora-red" />
            <h1 className="text-3xl font-bold">Mi Lista</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-nexora-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Nueva lista
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-video skeleton rounded-xl" />
            ))}
          </div>
        ) : !lists || lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <List className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aún no tienes listas</h2>
            <p className="text-gray-400 mb-6">Crea tu primera lista para organizar películas y series</p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-nexora-red hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Crear lista
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {lists.map((list: any) => (
                <ListCard key={list.id} list={list} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateListModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  );
}
