import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useContent(params?: any) {
  return useQuery({
    queryKey: ['content', params],
    queryFn: async () => {
      const res = await api.get('/content', { params });
      return res.data.data;
    },
  });
}

export function useContentById(id: string) {
  return useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
      const res = await api.get(`/content/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useFeaturedContent() {
  return useQuery({
    queryKey: ['content', 'featured'],
    queryFn: async () => {
      const res = await api.get('/content/featured');
      return res.data.data;
    },
  });
}

export function useTrendingContent() {
  return useQuery({
    queryKey: ['content', 'trending'],
    queryFn: async () => {
      const res = await api.get('/content/trending');
      return res.data.data;
    },
  });
}

export function useNewReleases() {
  return useQuery({
    queryKey: ['content', 'new'],
    queryFn: async () => {
      const res = await api.get('/content/new-releases');
      return res.data.data;
    },
  });
}

export function useContinueWatching() {
  return useQuery({
    queryKey: ['watch-history', 'continue'],
    queryFn: async () => {
      const res = await api.get('/watch-history/continue-watching');
      return res.data.data;
    },
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const res = await api.get('/recommendations');
      return res.data.data;
    },
  });
}

export function useSimilarContent(contentId: string) {
  return useQuery({
    queryKey: ['recommendations', 'similar', contentId],
    queryFn: async () => {
      const res = await api.get(`/recommendations/similar/${contentId}`);
      return res.data.data;
    },
    enabled: !!contentId,
  });
}

export function useFavoriteToggle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contentId: string) => api.post(`/favorites/${contentId}`),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(data.data.data.message);
    },
    onError: () => toast.error('Error al actualizar favoritos'),
  });
}

export function useUpdateProgress() {
  return useMutation({
    mutationFn: (data: any) => api.post('/watch-history/progress', data),
  });
}

export function useSignedUrl(contentId: string, episodeId?: string) {
  return useQuery({
    queryKey: ['signed-url', contentId, episodeId],
    queryFn: async () => {
      const params = episodeId ? { episodeId } : {};
      const res = await api.get(`/content/${contentId}/signed-url`, { params });
      return res.data.data;
    },
    enabled: !!contentId,
    staleTime: 1000 * 60 * 50, // 50 min (URL expires in 1h)
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const res = await api.get('/content/genres');
      return res.data.data;
    },
    staleTime: Infinity,
  });
}

export function useRateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { contentId: string; rating: number; review?: string }) =>
      api.post('/ratings', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content'] });
      toast.success('¡Valoración guardada!');
    },
  });
}
