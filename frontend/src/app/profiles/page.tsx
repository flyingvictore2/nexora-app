'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Check, Baby } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

export default function ProfilesPage() {
  const router = useRouter();
  const { user, setActiveProfile } = useAuthStore();
  const qc = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [isKids, setIsKids] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => (await api.get('/profiles')).data.data,
  });

  const createProfile = useMutation({
    mutationFn: (data: any) => api.post('/profiles', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
      setCreating(false);
      setNewName('');
      toast.success('Perfil creado');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const deleteProfile = useMutation({
    mutationFn: (id: string) => api.delete(`/profiles/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Perfil eliminado');
    },
  });

  const handleSelect = (profile: any) => {
    if (editMode) return;
    setActiveProfile(profile);
    router.push('/');
  };

  const AVATAR_COLORS = ['bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-600', 'bg-purple-600'];

  return (
    <div className="min-h-screen bg-nexora-dark flex flex-col items-center justify-center px-4">
      <Link href="/" className="mb-12">
        <span className="text-nexora-red font-black text-3xl tracking-widest">NEXORA</span>
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        {editMode ? 'Gestionar perfiles' : '¿Quién está viendo?'}
      </h1>
      <p className="text-gray-400 mb-10 text-sm">
        {editMode ? 'Edita o elimina tus perfiles' : 'Selecciona tu perfil'}
      </p>

      {isLoading ? (
        <div className="flex gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-28 h-28 skeleton rounded" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 md:gap-6 justify-center mb-8">
          {profiles.map((p: any, idx: number) => (
            <div
              key={p.id}
              className="flex flex-col items-center gap-2 cursor-pointer group"
              onClick={() => handleSelect(p)}
            >
              <div className="relative">
                <div className="w-28 h-28 rounded overflow-hidden border-2 border-transparent group-hover:border-white transition-colors">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {p.isKids && (
                  <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                    <Baby className="w-3 h-3 text-black" />
                  </div>
                )}

                {editMode && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 rounded">
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {!p.isDefault && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteProfile.mutate(p.id); }}
                        className="p-1.5 bg-red-600/70 hover:bg-red-600 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium group-hover:text-white transition-colors text-gray-300">
                {p.name}
              </span>
            </div>
          ))}

          {/* Add profile */}
          {profiles.length < 4 && !creating && (
            <div
              className="flex flex-col items-center gap-2 cursor-pointer group"
              onClick={() => setCreating(true)}
            >
              <div className="w-28 h-28 rounded bg-nexora-dark-3 border-2 border-dashed border-white/20 group-hover:border-white/50 flex items-center justify-center transition-colors">
                <Plus className="w-10 h-10 text-gray-500 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm text-gray-500 group-hover:text-white transition-colors">Añadir perfil</span>
            </div>
          )}

          {/* Create form */}
          {creating && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-28 h-28 rounded bg-nexora-dark-3 flex items-center justify-center text-3xl font-bold border-2 border-nexora-red">
                {newName ? newName.charAt(0).toUpperCase() : '?'}
              </div>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre del perfil"
                className="w-28 text-center bg-nexora-dark-3 border border-white/20 rounded px-2 py-1 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newName.trim()) {
                    createProfile.mutate({ name: newName.trim(), isKids });
                  }
                  if (e.key === 'Escape') setCreating(false);
                }}
              />
              <label className="flex items-center gap-1 text-xs text-gray-400">
                <input type="checkbox" checked={isKids} onChange={(e) => setIsKids(e.target.checked)} />
                Perfil infantil
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => newName.trim() && createProfile.mutate({ name: newName.trim(), isKids })}
                  className="p-1 bg-nexora-red rounded"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setCreating(false)} className="p-1 bg-white/10 rounded text-xs px-2">
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setEditMode(!editMode)}
        className="border border-white/30 hover:border-white text-sm px-6 py-2 rounded transition-colors"
      >
        {editMode ? 'Listo' : 'Gestionar perfiles'}
      </button>
    </div>
  );
}
