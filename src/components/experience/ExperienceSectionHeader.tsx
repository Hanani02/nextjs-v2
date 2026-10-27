"use client";

import SectionHeader from "@/components/ui/sectionHeader";
import { useLanguage } from "@/context/LanguageContext";

export default function ExperienceSectionHeader() {
  const { dictionary } = useLanguage();

  return (
    <SectionHeader
      title={dictionary.exp_title}
      highlight={dictionary.exp_title_highlight}
      badge={dictionary.exp_badge}
      description={dictionary.exp_description}
    />
  );
}
