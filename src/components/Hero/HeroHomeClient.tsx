'use client';

import { useRef } from 'react';
import HeroBackground from '@/components/Hero/HeroBackground';
import HeroRoom from '@/components/Hero/IsometricRoom/HeroRoom';
import LinkButton from '@/components/ui/LinkButton';
import { LuArrowRight } from 'react-icons/lu';
import { useLanguage } from '@/context/LanguageContext';
import type { SiteConfig } from '@/types/admin';

interface HeroHomeClientProps {
  hero: SiteConfig['hero'];
}

export default function HeroHomeClient({ hero }: HeroHomeClientProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { dictionary, isId } = useLanguage();

  const isDefaultGreeting = !hero.greeting || hero.greeting.includes("Halo, saya") || hero.greeting.includes("Hello I'm");
  const isDefaultHeadline = !hero.headline || hero.headline.includes("Membangun pengalaman") || hero.headline.includes("Building modern web");
  const isDefaultHighlight = !hero.headlineHighlight || ['kode bersih', 'clean code'].includes(hero.headlineHighlight.trim().toLowerCase());
  const isDefaultDesc = !hero.description || hero.description.includes("Saya merancang") || hero.description.includes("I design and build");
  const isDefaultCtaContact = !hero.ctaContactText || ['hubungi saya', 'get in touch'].includes(hero.ctaContactText.trim().toLowerCase());
  const isDefaultCtaProjects = !hero.ctaProjectsText || ['lihat proyek', 'view projects'].includes(hero.ctaProjectsText.trim().toLowerCase());

  const greeting = isDefaultGreeting ? dictionary.hero_greeting : (isId ? hero.greeting : dictionary.hero_greeting);
  const headline = isDefaultHeadline ? dictionary.hero_headline : (isId ? hero.headline : dictionary.hero_headline);
  const headlineHighlight = isDefaultHighlight ? dictionary.hero_headline_highlight : (isId ? hero.headlineHighlight : dictionary.hero_headline_highlight);
  const description = isDefaultDesc ? dictionary.hero_description : (isId ? hero.description : dictionary.hero_description);
  const ctaContact = isDefaultCtaContact ? dictionary.hero_cta_contact : (isId ? hero.ctaContactText : dictionary.hero_cta_contact);
  const ctaProjects = isDefaultCtaProjects ? dictionary.hero_cta_projects : (isId ? hero.ctaProjectsText : dictionary.hero_cta_projects);

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
              {greeting}
            </h3>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm border border-border">
              {hero.roles || dictionary.hero_roles}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-text">
              {headline} <span className="text-primary">{headlineHighlight}</span>
            </h1>

            <p className="text-gray-400 max-w-lg tracking-wide leading-relaxed">
              {description}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <LinkButton
                text={ctaContact}
                href="#contact"
                rounded
                icon={LuArrowRight}
              />
              <LinkButton
                text={ctaProjects}
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
