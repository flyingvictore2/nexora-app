'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X, Upload, Loader2, Plus, Trash2, ChevronDown, ChevronRight,
  Server, Link2, Film, List,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

/* ─── Types ──────────────────────────────────────────────────── */

type SourceType = 'DIRECT' | 'EMBED' | 'HLS';

interface LocalSource {
  id?: string;
  serverName: string;
  url: string;
  quality: string;
  type: SourceType;
  isDefault: boolean;
}

interface LocalEpisode {
  id?: string;
  number: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  sources: LocalSource[];
}

interface LocalSeason {
  id?: string;
  number: number;
  title: string;
  episodes: LocalEpisode[];
  open: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────── */

const blankSource = (): LocalSource => ({
  serverName: '', url: '', quality: '1080p', type: 'DIRECT', isDefault: false,
});

const blankEpisode = (num: number): LocalEpisode => ({
  number: num, title: `Episodio ${num}`, description: '',
  thumbnailUrl: '', duration: '', sources: [blankSource()],
});

const blankSeason = (num: number): LocalSeason => ({
  number: num, title: `Temporada ${num}`, episodes: [blankEpisode(1)], open: true,
});

/* ─── Zod schema ─────────────────────────────────────────────── */

const schema = z.object({
  title: z.string().min(1, 'Requerido'),
  originalTitle: z.string().optional(),
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  type: z.enum(['MOVIE', 'SERIES', 'ANIME']),
  posterUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  trailerUrl: z.string().optional(),
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

/* ─── Source row component ───────────────────────────────────── */

function SourceRow({
  source, onChange, onRemove, isFirst,
}: {
  source: LocalSource;
  onChange: (s: LocalSource) => void;
  onRemove: () => void;
  isFirst: boolean;
}) {
  const inputCls = 'bg-nexora-dark border border-white/20 rounded px-2 py-1.5 text-xs focus:border-nexora-red w-full';
  return (
    <div className="flex gap-2 items-start bg-white/5 rounded-lg p-2">
      <div className="flex-1 grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-gray-500 mb-0.5 block">Servidor</label>
          <input
            value={source.serverName}
            onChange={(e) => onChange({ ...source, serverName: e.target.value })}
            placeholder="Ej: LuluStream, Voe, Mega..."
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 mb-0.5 block">Tipo</label>
          <select
            value={source.type}
            onChange={(e) => onChange({ ...source, type: e.target.value as SourceType })}
            className={inputCls}
          >
            <option value="DIRECT">Directo (MP4)</option>
            <option value="HLS">HLS (M3U8)</option>
            <option value="EMBED">Embed (iframe)</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-[10px] text-gray-500 mb-0.5 block">URL</label>
          <input
            value={source.url}
            onChange={(e) => onChange({ ...source, url: e.target.value })}
            placeholder={source.type === 'EMBED' ? 'https://lulustream.com/e/...' : 'https://cdn.example.com/video.mp4'}
            className={cn(inputCls, 'font-mono')}
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 mb-0.5 block">Calidad</label>
          <select
            value={source.quality}
            onChange={(e) => onChange({ ...source, quality: e.target.value })}
            className={inputCls}
          >
            {['4K', '1080p', '720p', '480p', '360p', 'Auto'].map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-1.5 cursor-pointer pb-1">
            <input
              type="checkbox"
              checked={source.isDefault}
              onChange={(e) => onChange({ ...source, isDefault: e.target.checked })}
              className="accent-nexora-red"
            />
            <span className="text-xs text-gray-400">Por defecto</span>
          </label>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={isFirst}
        className="mt-5 p-1 text-gray-500 hover:text-red-400 disabled:opacity-30 flex-shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

interface ContentFormProps {
  content?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ContentForm({ content, onClose, onSuccess }: ContentFormProps) {
  const isEditing = !!content;
  const qc = useQueryClient();
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'episodes'>('info');

  // Movie video sources
  const [movieSources, setMovieSources] = useState<LocalSource[]>([blankSource()]);

  // Series seasons/episodes
  const [seasons, setSeasons] = useState<LocalSeason[]>([blankSeason(1)]);

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

  // Load existing data when editing
  useEffect(() => {
    if (!content) return;

    // Load movie sources
    if (content.videoSources && content.videoSources.length > 0) {
      setMovieSources(content.videoSources.map((s: any) => ({
        id: s.id, serverName: s.serverName, url: s.url,
        quality: s.quality || '1080p', type: s.type, isDefault: s.isDefault,
      })));
    } else if (content.videoUrl) {
      setMovieSources([{
        serverName: 'Principal', url: content.videoUrl,
        quality: '1080p', type: 'DIRECT' as SourceType, isDefault: true,
      }]);
    }

    // Load seasons/episodes
    if (content.seasons && content.seasons.length > 0) {
      setSeasons(content.seasons.map((s: any) => ({
        id: s.id,
        number: s.number,
        title: s.title || `Temporada ${s.number}`,
        open: false,
        episodes: (s.episodes || []).map((ep: any) => ({
          id: ep.id,
          number: ep.number,
          title: ep.title,
          description: ep.description || '',
          thumbnailUrl: ep.thumbnailUrl || '',
          duration: ep.duration ? String(ep.duration) : '',
          sources: ep.videoSources && ep.videoSources.length > 0
            ? ep.videoSources.map((vs: any) => ({
                id: vs.id, serverName: vs.serverName, url: vs.url,
                quality: vs.quality || '1080p', type: vs.type, isDefault: vs.isDefault,
              }))
            : ep.videoUrl
              ? [{ serverName: 'Principal', url: ep.videoUrl, quality: '1080p', type: 'DIRECT' as SourceType, isDefault: true }]
              : [blankSource()],
        })),
      })));
    }
  }, [content]);

  /* ── Image upload ── */
  const handleImageUpload = async (file: File, type: 'poster' | 'banner', setLoading: (v: boolean) => void) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post(`/uploads/image/${type}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setValue(type === 'poster' ? 'posterUrl' : 'bannerUrl', res.data.data.url);
      toast.success('Imagen subida');
    } catch {
      toast.error('Error al subir imagen');
    } finally {
      setLoading(false);
    }
  };

  /* ── Season helpers ── */
  const addSeason = () => setSeasons((prev) => [...prev, blankSeason(prev.length + 1)]);

  const removeSeason = (si: number) =>
    setSeasons((prev) => prev.filter((_, i) => i !== si).map((s, i) => ({ ...s, number: i + 1 })));

  const toggleSeason = (si: number) =>
    setSeasons((prev) => prev.map((s, i) => i === si ? { ...s, open: !s.open } : s));

  const updateSeason = (si: number, patch: Partial<LocalSeason>) =>
    setSeasons((prev) => prev.map((s, i) => i === si ? { ...s, ...patch } : s));

  const addEpisode = (si: number) =>
    setSeasons((prev) => prev.map((s, i) => i === si
      ? { ...s, episodes: [...s.episodes, blankEpisode(s.episodes.length + 1)] }
      : s));

  const removeEpisode = (si: number, ei: number) =>
    setSeasons((prev) => prev.map((s, i) => i === si
      ? { ...s, episodes: s.episodes.filter((_, j) => j !== ei).map((ep, j) => ({ ...ep, number: j + 1 })) }
      : s));

  const updateEpisode = (si: number, ei: number, patch: Partial<LocalEpisode>) =>
    setSeasons((prev) => prev.map((s, i) => i === si
      ? { ...s, episodes: s.episodes.map((ep, j) => j === ei ? { ...ep, ...patch } : ep) }
      : s));

  const addSource = (si: number, ei: number) =>
    updateEpisode(si, ei, { sources: [...seasons[si].episodes[ei].sources, blankSource()] });

  const removeSource = (si: number, ei: number, vi: number) =>
    updateEpisode(si, ei, { sources: seasons[si].episodes[ei].sources.filter((_, k) => k !== vi) });

  const updateSource = (si: number, ei: number, vi: number, patch: LocalSource) =>
    updateEpisode(si, ei, { sources: seasons[si].episodes[ei].sources.map((s, k) => k === vi ? patch : s) });

  /* ── Movie source helpers ── */
  const addMovieSource = () => setMovieSources((p) => [...p, blankSource()]);
  const removeMovieSource = (i: number) => setMovieSources((p) => p.filter((_, k) => k !== i));
  const updateMovieSource = (i: number, s: LocalSource) => setMovieSources((p) => p.map((x, k) => k === i ? s : x));

  /* ── Save ── */
  const handleSave = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        genres: data.genres ? data.genres.split(',').map((g) => g.trim()).filter(Boolean) : [],
        cast: data.cast ? data.cast.split(',').map((c) => c.trim()).filter(Boolean) : [],
        videoUrl: null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
      };

      let contentId = content?.id;

      if (isEditing) {
        await api.put(`/content/${contentId}`, payload);
      } else {
        const res = await api.post('/content', payload);
        contentId = res.data.data?.id || res.data.id;
      }

      // Handle video sources / episodes
      if (data.type === 'MOVIE') {
        // Replace all movie video sources
        if (isEditing) {
          await api.delete(`/video-sources/content/${contentId}/all`).catch(() => {});
        }
        for (const [idx, src] of movieSources.entries()) {
          if (!src.url) continue;
          await api.post('/video-sources', {
            contentId,
            serverName: src.serverName || `Servidor ${idx + 1}`,
            url: src.url,
            quality: src.quality,
            type: src.type,
            order: idx,
            isDefault: idx === 0 || src.isDefault,
          });
        }
      } else {
        // Series/Anime: create/update seasons and episodes
        for (const [si, season] of seasons.entries()) {
          let seasonId = season.id;
          if (!seasonId) {
            const sr = await api.post('/seasons', {
              contentId, number: season.number, title: season.title,
            });
            seasonId = sr.data.data?.id || sr.data.id;
          } else {
            await api.put(`/seasons/${seasonId}`, { title: season.title });
          }

          for (const [ei, ep] of season.episodes.entries()) {
            let episodeId = ep.id;
            const epPayload = {
              seasonId,
              number: ep.number,
              title: ep.title,
              description: ep.description || undefined,
              thumbnailUrl: ep.thumbnailUrl || undefined,
              duration: ep.duration ? parseInt(ep.duration) : undefined,
            };
            if (!episodeId) {
              const er = await api.post('/episodes', epPayload);
              episodeId = er.data.data?.id || er.data.id;
            } else {
              await api.put(`/episodes/${episodeId}`, epPayload);
              // Clear existing sources for this episode
              await api.delete(`/video-sources/episode/${episodeId}/all`).catch(() => {});
            }

            // Create video sources for this episode
            for (const [vi, src] of ep.sources.entries()) {
              if (!src.url) continue;
              await api.post('/video-sources', {
                episodeId,
                serverName: src.serverName || `Servidor ${vi + 1}`,
                url: src.url,
                quality: src.quality,
                type: src.type,
                order: vi,
                isDefault: vi === 0 || src.isDefault,
              });
            }
          }
        }
      }

      qc.invalidateQueries({ queryKey: ['admin-content'] });
      toast.success(isEditing ? 'Contenido actualizado' : 'Contenido creado');
      onSuccess();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'info', label: 'Información', icon: Film },
    { id: 'media', label: 'Imágenes / Trailer', icon: Link2 },
    { id: 'episodes', label: contentType === 'MOVIE' ? 'Servidores' : 'Temporadas', icon: contentType === 'MOVIE' ? Server : List },
  ] as const;

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="w-full max-w-4xl bg-nexora-dark-2 border border-white/10 rounded-xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold">
            {isEditing ? `Editar: ${content.title}` : 'Añadir nuevo contenido'}
          </h2>
          <button onClick={onClose} className="p-1 hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === t.id
                  ? 'border-nexora-red text-white'
                  : 'border-transparent text-gray-400 hover:text-white',
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(handleSave)} className="p-6">

          {/* ── TAB: INFO ── */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de contenido *</label>
                <div className="flex gap-4">
                  {(['MOVIE', 'SERIES', 'ANIME'] as const).map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input {...register('type')} type="radio" value={t} className="accent-nexora-red" />
                      <span className="text-sm">{t === 'MOVIE' ? 'Película' : t === 'SERIES' ? 'Serie' : 'Anime'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Title */}
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

              {/* Description */}
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

              {/* Meta */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Año *</label>
                  <input {...register('releaseYear')} type="number" className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm" />
                </div>
                {contentType === 'MOVIE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Duración (min)</label>
                    <input {...register('duration')} type="number" className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Clasificación</label>
                  <select {...register('maturityRating')} className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm">
                    {['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-PG', 'TV-14', 'TV-MA', 'ALL'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Plan</label>
                  <select {...register('requiredPlan')} className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm">
                    <option value="FREE">Gratis</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Géneros (separados por coma)</label>
                  <input {...register('genres')} className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm" placeholder="Acción, Drama..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Reparto</label>
                  <input {...register('cast')} className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm" placeholder="Actor 1, Actor 2..." />
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">Estreno programado</label>
                  <input {...register('scheduledAt')} type="datetime-local" className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

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
            </div>
          )}

          {/* ── TAB: MEDIA ── */}
          {activeTab === 'media' && (
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Poster (500×750)</label>
                  <div className="flex gap-2">
                    <input
                      {...register('posterUrl')}
                      className="flex-1 bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm focus:border-nexora-red"
                      placeholder="https://..."
                    />
                    <label className={cn('flex items-center gap-1 px-3 py-2 bg-nexora-dark-3 border border-white/20 rounded-lg text-sm cursor-pointer hover:bg-white/10 flex-shrink-0', uploadingPoster && 'opacity-50 pointer-events-none')}>
                      {uploadingPoster ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'poster', setUploadingPoster); }} />
                    </label>
                  </div>
                  {posterUrl && <img src={posterUrl} alt="poster" className="mt-2 w-20 h-28 object-cover rounded" />}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Banner (1920×1080)</label>
                  <div className="flex gap-2">
                    <input
                      {...register('bannerUrl')}
                      className="flex-1 bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm focus:border-nexora-red"
                      placeholder="https://..."
                    />
                    <label className={cn('flex items-center gap-1 px-3 py-2 bg-nexora-dark-3 border border-white/20 rounded-lg text-sm cursor-pointer hover:bg-white/10 flex-shrink-0', uploadingBanner && 'opacity-50 pointer-events-none')}>
                      {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'banner', setUploadingBanner); }} />
                    </label>
                  </div>
                  {bannerUrl && <img src={bannerUrl} alt="banner" className="mt-2 w-full h-16 object-cover rounded" />}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Trailer URL (YouTube o directo)</label>
                <input
                  {...register('trailerUrl')}
                  className="w-full bg-nexora-dark-3 border border-white/20 rounded-lg px-3 py-2 text-sm focus:border-nexora-red"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          )}

          {/* ── TAB: EPISODES / SERVERS ── */}
          {activeTab === 'episodes' && (
            <div className="space-y-4">
              {contentType === 'MOVIE' ? (
                /* ── Movie: multiple servers ── */
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    Añade uno o varios servidores de reproducción para esta película.
                    El primero marcado como <em>por defecto</em> se reproducirá automáticamente.
                  </p>
                  {movieSources.map((src, i) => (
                    <SourceRow
                      key={i}
                      source={src}
                      onChange={(s) => updateMovieSource(i, s)}
                      onRemove={() => removeMovieSource(i)}
                      isFirst={movieSources.length === 1}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addMovieSource}
                    className="flex items-center gap-2 text-sm text-nexora-red hover:text-red-400 font-medium"
                  >
                    <Plus className="w-4 h-4" /> Añadir servidor
                  </button>
                </div>
              ) : (
                /* ── Series/Anime: seasons + episodes ── */
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    Gestiona temporadas y episodios. Cada episodio puede tener múltiples servidores.
                  </p>

                  {seasons.map((season, si) => (
                    <div key={si} className="border border-white/10 rounded-xl overflow-hidden">
                      {/* Season header */}
                      <div className="flex items-center gap-3 p-3 bg-white/5">
                        <button
                          type="button"
                          onClick={() => toggleSeason(si)}
                          className="p-0.5 text-gray-400 hover:text-white"
                        >
                          {season.open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <span className="text-xs text-gray-500 font-medium uppercase">T{season.number}</span>
                        <input
                          value={season.title}
                          onChange={(e) => updateSeason(si, { title: e.target.value })}
                          className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
                          placeholder={`Temporada ${season.number}`}
                        />
                        <span className="text-xs text-gray-500">{season.episodes.length} ep.</span>
                        <button
                          type="button"
                          onClick={() => removeSeason(si)}
                          disabled={seasons.length === 1}
                          className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Episodes */}
                      {season.open && (
                        <div className="p-3 space-y-4">
                          {season.episodes.map((ep, ei) => (
                            <div key={ei} className="border border-white/10 rounded-lg p-3 space-y-3 bg-nexora-dark/50">
                              {/* Episode header */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-nexora-red font-bold w-6 flex-shrink-0">
                                  E{ep.number}
                                </span>
                                <input
                                  value={ep.title}
                                  onChange={(e) => updateEpisode(si, ei, { title: e.target.value })}
                                  className="flex-1 bg-nexora-dark-3 border border-white/20 rounded px-2 py-1.5 text-sm focus:border-nexora-red"
                                  placeholder="Título del episodio"
                                />
                                <input
                                  value={ep.duration}
                                  onChange={(e) => updateEpisode(si, ei, { duration: e.target.value })}
                                  type="number"
                                  placeholder="Min"
                                  className="w-16 bg-nexora-dark-3 border border-white/20 rounded px-2 py-1.5 text-xs text-center focus:border-nexora-red"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeEpisode(si, ei)}
                                  disabled={season.episodes.length === 1}
                                  className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-30 flex-shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Episode extra */}
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  value={ep.thumbnailUrl}
                                  onChange={(e) => updateEpisode(si, ei, { thumbnailUrl: e.target.value })}
                                  placeholder="URL miniatura"
                                  className="bg-nexora-dark-3 border border-white/20 rounded px-2 py-1.5 text-xs focus:border-nexora-red"
                                />
                                <input
                                  value={ep.description}
                                  onChange={(e) => updateEpisode(si, ei, { description: e.target.value })}
                                  placeholder="Descripción breve"
                                  className="bg-nexora-dark-3 border border-white/20 rounded px-2 py-1.5 text-xs focus:border-nexora-red"
                                />
                              </div>

                              {/* Episode sources */}
                              <div className="space-y-2">
                                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide flex items-center gap-1">
                                  <Server className="w-3 h-3" /> Servidores
                                </p>
                                {ep.sources.map((src, vi) => (
                                  <SourceRow
                                    key={vi}
                                    source={src}
                                    onChange={(s) => updateSource(si, ei, vi, s)}
                                    onRemove={() => removeSource(si, ei, vi)}
                                    isFirst={ep.sources.length === 1}
                                  />
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addSource(si, ei)}
                                  className="flex items-center gap-1 text-xs text-nexora-red hover:text-red-400"
                                >
                                  <Plus className="w-3 h-3" /> Añadir servidor
                                </button>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => addEpisode(si)}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-dashed border-white/20 hover:border-white/40 rounded-lg px-4 py-2 w-full justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4" /> Añadir episodio
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addSeason}
                    className="flex items-center gap-2 text-sm text-nexora-red hover:text-red-400 font-medium"
                  >
                    <Plus className="w-4 h-4" /> Añadir temporada
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-white/10">
            <div className="flex gap-2">
              {tabs.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(tabs[i === 0 ? 0 : i - 1].id)}
                  className={cn('px-3 py-1.5 text-xs rounded bg-white/10 hover:bg-white/20', i === 0 && 'opacity-0 pointer-events-none')}
                >
                  ← Anterior
                </button>
              )).filter((_, i) => i > 0).slice(0, 1)}
            </div>
            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                Cancelar
              </button>
              {activeTab !== 'episodes' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'info' ? 'media' : 'episodes')}
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg text-sm"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-nexora-red hover:bg-red-700 text-white font-medium rounded-lg text-sm disabled:opacity-70"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEditing ? 'Guardar cambios' : 'Crear contenido'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
