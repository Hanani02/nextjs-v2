import ExperienceSection from "@/section/ExperienceSection";
import HeroSections from "@/section/HeroSections";
import AboutSection from "@/section/aboutSection";
import ProjectSection from "@/section/projectSection";
import ContactSection from "@/section/ContactSection";
import Footer from "@/section/Footer";
import { Toaster } from "react-hot-toast";
import AnimationLayout from "@/components/layouts/animationsLayout";

export default function Home () {
  return (
    
    <AnimationLayout>
      <HeroSections />
      <AboutSection />
      <ProjectSection />
      <ExperienceSection />
      <ContactSection />
      <Footer />
      <Toaster />
    </AnimationLayout>
    
  );
}