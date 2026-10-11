'use client';

import { useState, useRef, useEffect } from 'react';
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

  const [transitionState, setTransitionState] = useState({
    blur: 0,
    opacity: 1,
    scale: 1,
    translateY: 0,
    isFullyClear: true
  });

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Fraction of the section that has entered into the viewport from the bottom
      // 0 = top of section is at bottom of viewport
      // 1 = top of section has reached top of viewport
      const visibleRatio = 1 - rect.top / windowHeight;

      // When visibleRatio is <= 0: not yet visible, max blur
      // When visibleRatio reaches 0.5 (setengah jalan masuk ke home): blur perlahan hilang (fully clear)
      const threshold = 0.52;
      const progress = Math.min(Math.max(visibleRatio / threshold, 0), 1);

      // Smooth interpolation:
      // Blur: starts at 22px blur, decreases to 0px as progress reaches 1.0 (setengah scroll)
      const blur = (1 - progress) * 22;
      // Opacity: starts at 0.35, increases to 1.0
      const opacity = 0.35 + progress * 0.65;
      // Scale: starts at 0.95, expands to 1.0
      const scale = 0.95 + progress * 0.05;
      // Upward float: starts at 30px, moves to 0px
      const translateY = (1 - progress) * 30;

      const isFullyClear = progress >= 0.99;

      setTransitionState({
        blur: Math.round(blur * 10) / 10,
        opacity: Math.round(opacity * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        translateY: Math.round(translateY),
        isFullyClear
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen overflow-hidden flex items-center pt-24 py-12 transition-colors duration-500"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. SEAMLESS TOP GRADIENT (Blends pitch black Landing to LineWaves)
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-black via-black/70 to-transparent pointer-events-none z-20" />

      {/* ─────────────────────────────────────────────────────────────
          2. DYNAMIC BLUR & TRANSFORM WRAPPER
             Starts blurred on initial scroll, gradually clears as
             scroll enters halfway into the home section.
      ───────────────────────────────────────────────────────────── */}
      <div
        className="w-full h-full relative"
        style={{
          filter: transitionState.isFullyClear
            ? 'none'
            : `blur(${transitionState.blur}px)`,
          opacity: transitionState.opacity,
          transform: transitionState.isFullyClear
            ? 'none'
            : `scale(${transitionState.scale}) translateY(${transitionState.translateY}px)`,
          transition:
            'filter 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-out, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: transitionState.isFullyClear
            ? 'auto'
            : 'filter, opacity, transform'
        }}
      >
        {/* Background utama with theme-reactive LineWaves */}
        <HeroBackground />

        {/* Content Grid */}
        <div className="relative z-10 w-[90%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
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
      </div>
    </section>
  );
}
