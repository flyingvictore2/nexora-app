import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-nexora-dark border-t border-white/10 px-4 md:px-12 py-12 mt-16">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Youtube className="w-5 h-5" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm text-gray-400">
          <div className="space-y-3">
            <Link href="#" className="block hover:text-white transition-colors">Audio y subtítulos</Link>
            <Link href="#" className="block hover:text-white transition-colors">Centro de privacidad</Link>
            <Link href="#" className="block hover:text-white transition-colors">Centro de medios</Link>
          </div>
          <div className="space-y-3">
            <Link href="#" className="block hover:text-white transition-colors">Aviso legal</Link>
            <Link href="#" className="block hover:text-white transition-colors">Política de privacidad</Link>
            <Link href="#" className="block hover:text-white transition-colors">Notificaciones</Link>
          </div>
          <div className="space-y-3">
            <Link href="#" className="block hover:text-white transition-colors">Preferencias de cookies</Link>
            <Link href="#" className="block hover:text-white transition-colors">Información de la empresa</Link>
            <Link href="/subscription/plans" className="block hover:text-white transition-colors">Planes</Link>
          </div>
          <div className="space-y-3">
            <Link href="#" className="block hover:text-white transition-colors">Ayuda</Link>
            <Link href="#" className="block hover:text-white transition-colors">Empleos</Link>
            <Link href="#" className="block hover:text-white transition-colors">Contacto</Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <span className="text-nexora-red font-black text-xl tracking-widest">NEXORA</span>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Nexora. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
