import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => (await api.get('/friends')).data.data,
  });
}

export function usePendingRequests() {
  return useQuery({
    queryKey: ['friend-requests'],
    queryFn: async () => (await api.get('/friends/requests/pending')).data.data,
  });
}

export function useSearchUsers(q: string) {
  return useQuery({
    queryKey: ['user-search', q],
    queryFn: async () => (await api.get(`/friends/search?q=${encodeURIComponent(q)}`)).data.data,
    enabled: q.length >= 2,
  });
}

export function useFriendshipStatus(userId: string) {
  return useQuery({
    queryKey: ['friendship-status', userId],
    queryFn: async () => (await api.get(`/friends/status/${userId}`)).data.data,
    enabled: !!userId,
  });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.post(`/friends/request/${userId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['friends'] }); toast.success('Solicitud enviada'); },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Error al enviar solicitud'),
  });
}

export function useAcceptRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/friends/request/${id}/accept`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends'] });
      qc.invalidateQueries({ queryKey: ['friend-requests'] });
      toast.success('¡Ahora sois amigos!');
    },
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/friends/request/${id}/reject`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friend-requests'] }),
  });
}

export function useRemoveFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendId: string) => api.delete(`/friends/${friendId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['friends'] }); toast.success('Amigo eliminado'); },
  });
}
