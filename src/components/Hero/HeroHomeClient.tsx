'use client';

import { useRef } from 'react';
import HeroBackground from '@/components/Hero/HeroBackground';
import HeroRoom from '@/components/Hero/IsometricRoom/HeroRoom';
import LinkButton from '@/components/ui/LinkButton';
import { LuArrowRight } from 'react-icons/lu';
import type { SiteConfig } from '@/types/admin';

interface HeroHomeClientProps {
  hero: SiteConfig['hero'];
}

export default function HeroHomeClient({ hero }: HeroHomeClientProps) {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen overflow-hidden flex items-center pt-28 pb-16 transition-colors duration-500"
    >
      {/* Background utama with theme-reactive LineWaves spanning from top 0 */}
      <HeroBackground />

      {/* Content Grid */}
      <div className="relative z-10 w-[90%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-4 sm:pt-2">
          {/* Left Side: Headline, Roles, Bio, CTA */}
          <div className="space-y-6">
            <h3 className="text-2xl sm:text-3xl lg:text-2xl font-bold leading-tight text-text/80">
              {hero.greeting}
            </h3>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm border border-border">
              {hero.roles}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-text">
              {hero.headline} <span className="text-primary">{hero.headlineHighlight}</span>
            </h1>

            <p className="text-gray-400 max-w-lg tracking-wide leading-relaxed">
              {hero.description}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <LinkButton
                text={hero.ctaContactText || 'Hubungi Saya'}
                href="#contact"
                rounded
                icon={LuArrowRight}
              />
              <LinkButton
                text={hero.ctaProjectsText || 'Lihat Proyek'}
                href="#projects"
                rounded
                variant="outline"
              />
            </div>
          </div>

          {/* Right Side: Interactive 3D Isometric Developer Room */}
          <div className="flex justify-center items-center relative w-full overflow-visible">
            <HeroRoom profileImage={hero.profileImage} />
          </div>
        </div>
    </section>
  );
}
