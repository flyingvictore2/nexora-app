import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const ACCENT_COLORS = [
  { id: 'red',    name: 'Rojo',    hex: '#e50914', dark: '#b20710' },
  { id: 'blue',   name: 'Azul',    hex: '#2563eb', dark: '#1d4ed8' },
  { id: 'purple', name: 'Morado',  hex: '#7c3aed', dark: '#6d28d9' },
  { id: 'green',  name: 'Verde',   hex: '#16a34a', dark: '#15803d' },
  { id: 'orange', name: 'Naranja', hex: '#ea580c', dark: '#c2410c' },
  { id: 'pink',   name: 'Rosa',    hex: '#db2777', dark: '#be185d' },
  { id: 'teal',   name: 'Teal',    hex: '#0d9488', dark: '#0f766e' },
];

function applyAccent(id: string) {
  const c = ACCENT_COLORS.find((c) => c.id === id) ?? ACCENT_COLORS[0];
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--nexora-red', c.hex);
    document.documentElement.style.setProperty('--nexora-red-dark', c.dark);
  }
}

interface ThemeState {
  theme: 'dark' | 'light';
  accentColorId: string;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setAccentColor: (id: string) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      accentColorId: 'red',

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },

      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },

      setAccentColor: (id) => {
        applyAccent(id);
        set({ accentColorId: id });
      },

      // Call on app init to restore saved accent
      initTheme: () => {
        applyAccent(get().accentColorId);
        document.documentElement.classList.toggle('dark', get().theme === 'dark');
      },
    }),
    { name: 'nexora-theme' },
  ),
);
