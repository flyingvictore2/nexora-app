import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ── User hooks ────────────────────────────────────────────────────────────────
export function useMyTickets() {
  return useQuery({
    queryKey: ['support', 'my'],
    queryFn: async () => {
      const res = await api.get('/support/my');
      return res.data.data as any[];
    },
  });
}

export function useSubmitTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { subject: string; message: string; category?: string }) =>
      api.post('/support', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support', 'my'] });
      toast.success('¡Ticket enviado! Te responderemos lo antes posible.');
    },
    onError: () => toast.error('Error al enviar el ticket'),
  });
}

// ── Admin hooks ───────────────────────────────────────────────────────────────
export function useAdminTickets(params?: any) {
  return useQuery({
    queryKey: ['admin-tickets', params],
    queryFn: async () => {
      const res = await api.get('/support', { params });
      return res.data.data;
    },
  });
}

export function useSupportStats() {
  return useQuery({
    queryKey: ['admin-support-stats'],
    queryFn: async () => {
      const res = await api.get('/support/stats');
      return res.data.data;
    },
  });
}

export function useReplyTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminReply, status }: { id: string; adminReply: string; status?: string }) =>
      api.patch(`/support/${id}/reply`, { adminReply, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tickets'] });
      qc.invalidateQueries({ queryKey: ['admin-support-stats'] });
      toast.success('Respuesta enviada');
    },
    onError: () => toast.error('Error al responder'),
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/support/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tickets'] });
      qc.invalidateQueries({ queryKey: ['admin-support-stats'] });
      toast.success('Estado actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
  });
}
