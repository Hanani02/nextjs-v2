"use client";

import SectionHeader from "@/components/ui/sectionHeader";
import { useLanguage } from "@/context/LanguageContext";

export default function ProjectSectionHeader() {
  const { dictionary } = useLanguage();

  return (
    <SectionHeader
      title={dictionary.projects_title}
      highlight={dictionary.projects_title_highlight}
      badge={dictionary.projects_badge}
      description={dictionary.projects_description}
    />
  );
}
