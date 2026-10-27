import ExperienceSection from "@/components/section/ExperienceSection";
import HeroSections from "@/components/section/HeroSections";
import AboutSection from "@/components/section/aboutSection";
import ProjectSection from "@/components/section/projectSection";
import ContactSection from "@/components/section/ContactSection";
import Footer from "@/components/section/Footer";
import { Toaster } from "react-hot-toast";
import AnimationLayout from "@/components/layouts/animationsLayout";
import Marquee from "@/components/Hero/marquee";
import { getSiteConfigAsync } from "@/lib/site-config";

export const revalidate = 60;

export default async function Home() {
  const config = await getSiteConfigAsync();

  return (
    <AnimationLayout>
      <HeroSections initialHero={config.hero} />
      <Marquee />
      <AboutSection initialAbout={config.about} />
      <ProjectSection />
      <ExperienceSection />
      <ContactSection initialContact={config.contact} />
      <Footer />
      <Toaster />
    </AnimationLayout>
  );
}