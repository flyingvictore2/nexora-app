import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { MaintenanceGate } from '@/components/MaintenanceGate';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Nexora — Streaming', template: '%s | Nexora' },
  description: 'La mejor plataforma de streaming con películas, series y anime.',
  keywords: ['streaming', 'películas', 'series', 'anime', 'online'],
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} bg-nexora-dark text-white min-h-screen`}>
        <Providers><MaintenanceGate>{children}</MaintenanceGate></Providers>
      </body>
    </html>
  );
}
