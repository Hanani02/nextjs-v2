import LineWaves from "@/components/Hero/background";
import LinkButton from "@/components/ui/LinkButton";
import { LuArrowRight } from "react-icons/lu";
import Image from "next/image";
import { getDynamicHero } from "@/lib/site-config";
import type { SiteConfig } from "@/types/admin";

interface HeroSectionsProps {
  initialHero?: SiteConfig['hero'];
}

export default async function HeroSections({ initialHero }: HeroSectionsProps = {}) {
  const hero = initialHero ?? (await getDynamicHero());


  return (
    <section id="home" className="relative min-h-screen overflow-hidden flex items-center pt-30 py-10">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10" />

      {/* Background utama */}
      <div className="inset-0 absolute">
        <LineWaves
          speed={0.3}
          innerLineCount={32}
          outerLineCount={36}
          warpIntensity={1}
          rotation={-45}
          edgeFadeWidth={0}
          colorCycleSpeed={1}
          brightness={0.2}
          color1="#0F172A"
          color2="#312E81"
          color3="#A78BFA"
          enableMouseInteraction
          mouseInfluence={2}
        />
      </div>
      {/* content */}
      <div className="relative z-10 w-[90%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* leftside */}
        <div className="space-y-6">
          <h3
            data-aos="fade-up"
            fade-aos-delay="100"
            className="text-3xl md:text-5xl lg:text-2xl font-bold leading-tight text-text/80"
          >
            {hero.greeting}
          </h3>
          <span
            data-aos="fade-up"
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm border border-border"
          >
            {hero.roles}
          </span>
          <h1
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-text/70"
          >
            {hero.headline} <span className="text-primary/70">{hero.headlineHighlight}</span>
          </h1>

          <p data-aos="fade-up" data-aos-delay="400" className="text-gray-400 max-w-lg tracking-wide">
            {hero.description}
          </p>

          <div className="flex items-center gap-4 pt-2" data-aos="fade-up" data-aos-delay="600">
            <LinkButton
              text={hero.ctaContactText || "get in touch"}
              href="#contact"
              rounded
              icon={LuArrowRight}
            />
            <LinkButton
              text={hero.ctaProjectsText || "View projects"}
              href="#projects"
              rounded
              variant="outline"
            />
          </div>
        </div>
        {/* rightside */}
        <div className="flex justify-center lg:justify-end" data-aos="fade-left">
          <div className="relative w-85 h-85 md:w-110 md:h-110 rounded-full bg-surface/80 backdrop-blur-md border border-border flex items-center justify-center overflow-hidden">
            {/* Image glow */}
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            <Image
              fill
              src={hero.profileImage || "/image/profil.jpeg"}
              alt="Foto Profil Muhammad Akbar Hanani - Fullstack & Web Developer"
              sizes="(max-width: 768px) 340px, 440px"
              className="z-10 rounded-full transition-transform duration-300"
              style={{
                objectFit: hero.profileImageFit || 'cover',
                objectPosition: hero.profileImagePosition || 'center',
                transform: `scale(${hero.profileImageScale || 1})`,
              }}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
