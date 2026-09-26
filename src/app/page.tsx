import ExperienceSection from "@/components/section/ExperienceSection";
import HeroSections from "@/components/section/HeroSections";
import AboutSection from "@/components/section/aboutSection";
import ProjectSection from "@/components/section/projectSection";
import ContactSection from "@/components/section/ContactSection";
import Footer from "@/components/section/Footer";
import { Toaster } from "react-hot-toast";
import AnimationLayout from "@/components/layouts/animationsLayout";
import Marquee from "@/components/Hero/marquee";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default function Home() {
  const config = getSiteConfig();

  return (
    <AnimationLayout>
      <HeroSections />
      <Marquee />
      <AboutSection />
      <ProjectSection />
      <ExperienceSection />
      <ContactSection initialContact={config.contact} />
      <Footer />
      <Toaster />
    </AnimationLayout>
  );
}