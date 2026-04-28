import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DownloadItem {
  id: string; // unique: contentId + (episodeId || '')
  contentId: string;
  title: string;
  posterUrl?: string;
  type: string;
  episodeId?: string;
  episodeTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  duration?: number;
  addedAt: string;
}

interface DownloadsState {
  downloads: DownloadItem[];
  add: (item: Omit<DownloadItem, 'id' | 'addedAt'>) => void;
  remove: (id: string) => void;
  has: (contentId: string, episodeId?: string) => boolean;
  clear: () => void;
}

export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set, get) => ({
      downloads: [],

      add: (item) => {
        const id = `${item.contentId}-${item.episodeId ?? 'movie'}`;
        if (get().has(item.contentId, item.episodeId)) return;
        set((s) => ({
          downloads: [
            { ...item, id, addedAt: new Date().toISOString() },
            ...s.downloads,
          ],
        }));
      },

      remove: (id) =>
        set((s) => ({ downloads: s.downloads.filter((d) => d.id !== id) })),

      has: (contentId, episodeId) => {
        const id = `${contentId}-${episodeId ?? 'movie'}`;
        return get().downloads.some((d) => d.id === id);
      },

      clear: () => set({ downloads: [] }),
    }),
    { name: 'nexora-downloads' },
  ),
);
