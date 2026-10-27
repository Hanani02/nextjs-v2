import type { Metadata } from 'next';
import LandingPlayground from '@/components/Hero/Playground/LandingPlayground';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Neon Circuit Monza - 3D RC Racing Game',
  description:
    'Game balapan 3D RC Car multiplayer realtime di Autodromo Nazionale Monza. Kustomisasi mobil, drift di aspal neon, dan kalahkan rekor putaran!',
};

export default function GamePage() {
  return (
    <main className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-black select-none">
      <LandingPlayground />
      <Toaster position="bottom-center" />
    </main>
  );
}
