import HeroBackground from "@/components/Hero/HeroBackground";
import HeroRoom from "@/components/Hero/IsometricRoom/HeroRoom";
import LinkButton from "@/components/ui/LinkButton";
import { LuArrowRight } from "react-icons/lu";
import { getDynamicHero } from "@/lib/site-config";
import type { SiteConfig } from "@/types/admin";

interface HeroSectionsProps {
  initialHero?: SiteConfig['hero'];
}

export default async function HeroSections({ initialHero }: HeroSectionsProps = {}) {
  const hero = initialHero ?? (await getDynamicHero());


  return (
    <section id="home" className="relative min-h-screen overflow-hidden flex items-center pt-30 py-10">
      {/* Background utama with theme-reactive LineWaves */}
      <HeroBackground />
      {/* content */}
      <div className="relative z-10 w-[90%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* leftside */}
        <div className="space-y-6">
          <h3 className="text-3xl md:text-5xl lg:text-2xl font-bold leading-tight text-text/80">
            {hero.greeting}
          </h3>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm border border-border">
            {hero.roles}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-text/70">
            {hero.headline} <span className="text-primary/70">{hero.headlineHighlight}</span>
          </h1>

          <p className="text-gray-400 max-w-lg tracking-wide">
            {hero.description}
          </p>

          <div className="flex items-center gap-4 pt-2">
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
        {/* rightside - Interactive 3D Isometric Developer Room */}
        <div className="flex justify-center items-center relative w-full overflow-visible">
          <HeroRoom profileImage={hero.profileImage} />
        </div>
      </div>
    </section>
  );
}
