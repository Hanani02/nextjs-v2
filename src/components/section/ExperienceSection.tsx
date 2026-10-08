import SectionHeader from "@/components/ui/sectionHeader";
import ExperienceTimeline, { type Experience } from "@/components/experience/ExperienceTimeline";
import { getSupabase } from '@/lib/supabase';

export default async function ExperienceSection() {
  const { data: experienceData, error } = await getSupabase()
    .from('experience')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Experience fetch error:', error);
    return <p className="text-red-600">Gagal memuat data experience: {error.message}</p>;
  }

  const experiences: Experience[] = (experienceData ?? []).map((exp) => ({
    role: exp.role ?? '',
    company: exp.company ?? '',
    description: exp.descriptions ?? '',
    technologies: Array.isArray(exp.technologies)
      ? exp.technologies.filter(
          (tech: unknown): tech is string => typeof tech === 'string',
        )
      : [],
  }));

  return (
    <section id="experience" className="py-32 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10" />
      <div className="container mx-auto px-6 relative z-10">
        <SectionHeader
          title="Experience that"
          highlight="speaks volume"
          badge="Experience"
          description="Exploring my journey as a developer, from learning the fundamentals to building full-stack applications"
        />

        <ExperienceTimeline experiences={experiences} />
      </div>
    </section>
  );
}
