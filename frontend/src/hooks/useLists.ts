import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useLists() {
  return useQuery({
    queryKey: ['lists'],
    queryFn: async () => (await api.get('/lists')).data.data,
  });
}

export function useList(id: string) {
  return useQuery({
    queryKey: ['list', id],
    queryFn: async () => (await api.get(`/lists/${id}`)).data.data,
    enabled: !!id,
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; emoji?: string }) => api.post('/lists', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lists'] }); toast.success('Lista creada'); },
    onError: () => toast.error('Error al crear la lista'),
  });
}

export function useUpdateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; emoji?: string }) =>
      api.patch(`/lists/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lists'] }); toast.success('Lista actualizada'); },
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/lists/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lists'] }); toast.success('Lista eliminada'); },
    onError: () => toast.error('Error al eliminar la lista'),
  });
}

export function useAddToList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, contentId }: { listId: string; contentId: string }) =>
      api.post(`/lists/${listId}/items/${contentId}`),
    onSuccess: (res, { listId }) => {
      const added = res.data?.data?.added ?? res.data?.added;
      qc.invalidateQueries({ queryKey: ['lists'] });
      qc.invalidateQueries({ queryKey: ['list', listId] });
      qc.invalidateQueries({ queryKey: ['content-lists'] });
      if (added !== false) toast.success('Añadido a la lista');
    },
    onError: () => toast.error('Error al añadir'),
  });
}

export function useRemoveFromList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, contentId }: { listId: string; contentId: string }) =>
      api.delete(`/lists/${listId}/items/${contentId}`),
    onSuccess: (_, { listId }) => {
      qc.invalidateQueries({ queryKey: ['lists'] });
      qc.invalidateQueries({ queryKey: ['list', listId] });
      qc.invalidateQueries({ queryKey: ['content-lists'] });
      toast.success('Eliminado de la lista');
    },
  });
}

export function useContentLists(contentId: string) {
  return useQuery({
    queryKey: ['content-lists', contentId],
    queryFn: async () => (await api.get(`/lists/content/${contentId}`)).data.data,
    enabled: !!contentId,
  });
}
