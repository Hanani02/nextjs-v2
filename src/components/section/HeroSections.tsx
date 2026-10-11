import { getDynamicHero } from "@/lib/site-config";
import type { SiteConfig } from "@/types/admin";
import HeroHomeClient from "@/components/Hero/HeroHomeClient";

interface HeroSectionsProps {
  initialHero?: SiteConfig['hero'];
}

export default async function HeroSections({ initialHero }: HeroSectionsProps = {}) {
  const hero = initialHero ?? (await getDynamicHero());

  return <HeroHomeClient hero={hero} />;
}
