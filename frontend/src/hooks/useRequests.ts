import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ── User hooks ────────────────────────────────────────────────────────────────
export function useMyRequests() {
  return useQuery({
    queryKey: ['requests', 'my'],
    queryFn: async () => {
      const res = await api.get('/requests/my');
      return res.data.data as any[];
    },
  });
}

export function useSubmitRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; type: string; description?: string }) =>
      api.post('/requests', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests', 'my'] });
      toast.success('¡Solicitud enviada! Te avisaremos cuando sea revisada.');
    },
    onError: () => toast.error('Error al enviar la solicitud'),
  });
}

// ── Admin hooks ───────────────────────────────────────────────────────────────
export function useAdminRequests(params?: any) {
  return useQuery({
    queryKey: ['admin-requests', params],
    queryFn: async () => {
      const res = await api.get('/requests', { params });
      return res.data.data;
    },
  });
}

export function useRequestStats() {
  return useQuery({
    queryKey: ['admin-requests-stats'],
    queryFn: async () => {
      const res = await api.get('/requests/stats');
      return res.data.data;
    },
  });
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status: string; adminNote?: string }) =>
      api.patch(`/requests/${id}/status`, { status, adminNote }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-requests'] });
      qc.invalidateQueries({ queryKey: ['admin-requests-stats'] });
      toast.success('Estado actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
  });
}
