'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Loader2, Plus, Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(1, 'Requerido'),
  originalTitle: z.string().optional(),
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  type: z.enum(['MOVIE', 'SERIES', 'ANIME']),
  posterUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  trailerUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.coerce.number().optional(),
  releaseYear: z.coerce.number().min(1900).max(2030),
  genres: z.string().optional(),
  cast: z.string().optional(),
  director: z.string().optional(),
  studio: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  maturityRating: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  scheduledAt: z.string().optional(),
  requiredPlan: z.enum(['FREE', 'PREMIUM', 'VIP']).optional(),
});

type FormData = z.infer<typeof schema>;

interface ContentFormProps {
  content?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ContentForm({ content, onClose, onSuccess }: ContentFormProps) {
  const isEditing = !!content;
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: content?.title || '',
      originalTitle: content?.originalTitle || '',
      description: content?.description || '',
      type: content?.type || 'MOVIE',
      posterUrl: content?.posterUrl || '',
      bannerUrl: content?.bannerUrl || '',
      trailerUrl: content?.trailerUrl || '',
      videoUrl: content?.videoUrl || '',
      duration: content?.duration || undefined,
      releaseYear: content?.releaseYear || new Date().getFullYear(),
      genres: content?.genres?.join(', ') || '',
      cast: content?.cast?.join(', ') || '',
      director: content?.director || '',
      studio: content?.studio || '',
      country: content?.country || '',
      language: content?.language || 'es',
      maturityRating: content?.maturityRating || 'PG',
      isFeatured: content?.isFeatured || false,
      isTrending: content?.isTrending || false,
      isNew: content?.isNew || false,
      isPublished: content?.isPublished ?? true,
      requiredPlan: content?.requiredPlan || 'FREE',
    },
  });

  const posterUrl = watch('posterUrl');
  const bannerUrl = watch('bannerUrl');
  const contentType = watch('type');

  const save = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        genres: data.genres ? data.genres.split(',').map((g) => g.trim()).filter(Boolean) : [],
        cast: data.cast ? data.cast.split(',').map((c) => c.trim()).filter(Boolean) : [],
      };
      if (isEditing) {
        return api.put(`/content/${content.id}`, payload);
      }
      return api.post('/content', payload);
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Contenido actualizado' : 'Contenido creado');
      onSuccess();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error al guardar'),
  });

  const handleImageUpload = async (
    file: File,
    type: 'poster' | 'banner',
    setLoading: (v: boolean) => void,
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/uploads/image/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.data.url;
      setValue(type === 'poster' ? 'posterUrl' : 'bannerUrl', url);
      toast.success('Imagen subida');
    } catch {
      toast.error('Error al subir imagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="w-full max-w-3xl bg-nexora-dark-2 border border-white/10 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold">
            {isEditing ? `Editar: ${content.title}` : 'Añadir nuevo contenido'}
          </h2>
          <button onClick={onClose} className="p-1 hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => save.mutate(d))} className="p-6 space-y-6">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de contenido *</label>
            <div className="flex gap-3">
              {(['MOVIE', 'SERIES', 'ANIME'] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register('type')}
                    type="radio"
                    value={t}
                    className="accent-nexora-red"
                  />
                  <span className="text-sm">{t === 'MOVIE' ? 'Película' : t === 'SERIES' ? 'Serie' : 'Anime'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Basic info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Título *</label>
              <input
                {...register('title')}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm focus:border-nexora-red"
                placeholder="Título del contenido"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Título original</label>
              <input
                {...register('originalTitle')}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm focus:border-nexora-red"
                placeholder="Original title"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Descripción *</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm focus:border-nexora-red resize-none"
              placeholder="Descripción del contenido..."
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>

          {/* Video URL */}
          {contentType === 'MOVIE' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                URL del Video (MP4 o M3U8)
              </label>
              <input
                {...register('videoUrl')}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm focus:border-nexora-red font-mono"
                placeholder="https://... o rtmp://..."
              />
              <p className="text-xs text-gray-500 mt-1">Soporta .mp4, .m3u8 (HLS), y URLs de CDN</p>
            </div>
          )}

          {/* Images */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Poster (500×750)</label>
              <div className="flex gap-2">
                <input
                  {...register('posterUrl')}
                  className="flex-1 bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm focus:border-nexora-red"
                  placeholder="https://..."
                />
                <label className={cn(
                  'flex items-center gap-1 px-3 py-2 bg-nexora-dark-3 border border-white/20 rounded-lg text-sm cursor-pointer hover:bg-white/10 transition-colors flex-shrink-0',
                  uploadingPoster && 'opacity-50 pointer-events-none',
                )}>
                  {uploadingPoster ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'poster', setUploadingPoster);
                    }}
                  />
                </label>
              </div>
              {posterUrl && (
                <img src={posterUrl} alt="poster" className="mt-2 w-20 h-28 object-cover rounded" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Banner (1920×1080)</label>
              <div className="flex gap-2">
                <input
                  {...register('bannerUrl')}
                  className="flex-1 bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm focus:border-nexora-red"
                  placeholder="https://..."
                />
                <label className={cn(
                  'flex items-center gap-1 px-3 py-2 bg-nexora-dark-3 border border-white/20 rounded-lg text-sm cursor-pointer hover:bg-white/10 transition-colors flex-shrink-0',
                  uploadingBanner && 'opacity-50 pointer-events-none',
                )}>
                  {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'banner', setUploadingBanner);
                    }}
                  />
                </label>
              </div>
              {bannerUrl && (
                <img src={bannerUrl} alt="banner" className="mt-2 w-full h-16 object-cover rounded" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Trailer URL</label>
            <input
              {...register('trailerUrl')}
              className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm focus:border-nexora-red"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Año *</label>
              <input
                {...register('releaseYear')}
                type="number"
                className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            {contentType === 'MOVIE' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Duración (min)</label>
                <input
                  {...register('duration')}
                  type="number"
                  className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Clasificación</label>
              <select
                {...register('maturityRating')}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm"
              >
                {['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-PG', 'TV-14', 'TV-MA', 'ALL'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Plan requerido</label>
              <select
                {...register('requiredPlan')}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm"
              >
                <option value="FREE">Gratis</option>
                <option value="PREMIUM">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Géneros (separados por coma)</label>
              <input
                {...register('genres')}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm"
                placeholder="Acción, Drama, Thriller"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Reparto (separados por coma)</label>
              <input
                {...register('cast')}
                className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm"
                placeholder="Actor 1, Actor 2"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Director</label>
              <input {...register('director')} className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Estudio</label>
              <input {...register('studio')} className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">País</label>
              <input {...register('country')} className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Idioma</label>
              <select {...register('language')} className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm">
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="ja">Japonés</option>
                <option value="fr">Francés</option>
                <option value="pt">Portugués</option>
                <option value="de">Alemán</option>
                <option value="ko">Coreano</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Fecha de estreno programada</label>
              <input
                {...register('scheduledAt')}
                type="datetime-local"
                className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-4">
            {[
              { name: 'isPublished' as const, label: 'Publicado' },
              { name: 'isFeatured' as const, label: 'Destacado en home' },
              { name: 'isTrending' as const, label: 'En tendencias' },
              { name: 'isNew' as const, label: 'Nuevo estreno' },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer">
                <input {...register(name)} type="checkbox" className="w-4 h-4 accent-nexora-red rounded" />
                <span className="text-sm text-gray-300">{label}</span>
              </label>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={save.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-nexora-red hover:bg-nexora-red-dark text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-70"
            >
              {save.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear contenido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
