'use client';

import Image from 'next/image';
import { LuPencil, LuSparkles, LuArrowRight, LuUpload } from 'react-icons/lu';
import HeroBackground from '@/components/Hero/HeroBackground';
import type { SiteConfig } from '@/types/admin';

interface HeroPreviewProps {
  hero: SiteConfig['hero'] | undefined;
  onEdit: () => void;
}

export default function HeroPreview({ hero, onEdit }: HeroPreviewProps) {
  return (
    <section
      id="hero-admin"
      className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden border-b border-border/50"
    >
      {/* Background glow and LineWaves */}
      <HeroBackground />

      <div className="relative z-10 w-[90%] max-w-6xl mx-auto space-y-8">
        {/* Header & Edit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-semibold text-primary w-fit">
            <LuSparkles className="w-3.5 h-3.5" />
            Hero Section (Live Preview)
          </span>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-background font-semibold text-xs hover:bg-blue-400 shadow-lg shadow-primary/25 transition cursor-pointer w-fit"
          >
            <LuPencil className="w-3.5 h-3.5" />
            <span>Edit Hero & Foto Profil</span>
          </button>
        </div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold leading-tight text-text/80">
              {hero?.greeting || "── Hello I'm M. Akbar Hanani"}
            </h3>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm border border-border">
              {hero?.roles || 'Fullstack Developer | Web Developer | Mobile Developer'}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-text/90">
              {hero?.headline || 'Building modern web experience with'}{' '}
              <span className="text-primary">{hero?.headlineHighlight || 'clean code'}</span>
            </h1>
            <p className="text-gray-400 max-w-lg tracking-wide text-sm md:text-base leading-relaxed">
              {hero?.description ||
                'I design and build scalable fullstack applications using modern technologies like Next.js, TypeScript, and Supabase.'}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onEdit}
                className="px-6 py-3 rounded-xl bg-primary text-background font-semibold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-blue-400 transition cursor-pointer"
              >
                <span>{hero?.ctaContactText || 'get in touch'}</span>
                <LuArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="px-6 py-3 rounded-xl border border-border bg-card text-text text-sm font-semibold hover:border-primary/50 transition cursor-pointer"
              >
                {hero?.ctaProjectsText || 'View projects'}
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative group w-72 h-72 md:w-96 md:h-96 rounded-2xl bg-surface/80 backdrop-blur-md border border-border flex items-center justify-center p-4">
              <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-2xl pointer-events-none" />
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  fill
                  src={hero?.profileImage || '/image/profil.jpeg'}
                  alt="Profile Preview"
                  className="z-10 rounded-xl transition-transform duration-300"
                  style={{
                    objectFit: hero?.profileImageFit || 'cover',
                    objectPosition: hero?.profileImagePosition || 'center',
                    transform: `scale(${hero?.profileImageScale || 1})`,
                  }}
                  unoptimized
                />
              </div>
              <button
                type="button"
                onClick={onEdit}
                className="absolute bottom-4 right-4 z-20 p-2.5 rounded-full bg-primary text-background shadow-xl hover:scale-110 transition cursor-pointer"
                title="Ganti Foto Profil Hero"
              >
                <LuUpload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
