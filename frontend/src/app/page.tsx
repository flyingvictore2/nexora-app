import { Navbar } from '@/components/layout/Navbar';
import { HomeClient } from '@/components/home/HomeClient';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-nexora-dark">
      <Navbar />
      <main>
        <HomeClient />
      </main>
      <Footer />
    </div>
  );
}
