import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceMsg: string;
  hiddenSections: string[];
  currency: string;
}

export function useSiteSettings() {
  const { data, isLoading } = useQuery<SiteSettings>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data?.data ?? res.data;
    },
    staleTime: 30_000, // re-fetch every 30s
  });

  return {
    settings: data,
    isLoading,
    maintenanceMode: data?.maintenanceMode ?? false,
    hiddenSections: data?.hiddenSections ?? [],
    currency: data?.currency ?? 'USD',
    isHidden: (section: string) => (data?.hiddenSections ?? []).includes(section),
  };
}
