import SectionHeader from "@/components/ui/sectionHeader";
import ProjectCard from "@/components/project/ProjectCard"
import { projects } from "@/data/data"
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";

export default function projectSection() {
  return (
    <section id="projects" className="py-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10"/>
    <div className="w-[90%] max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeader
            title="some of my recent"
            highlight="work"
            badge="Projects"
            description="A selection of projects showcasing my ability to design, build, and scale modern fullstack applications"
            />
        </div>
        <div className="flex justify-end">
            <Link
                href="/Project/"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
            >
                Lihat lebih lengkap <LuArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
        </div>

    <div className="grid grid-cols1 md:grid-cols-2 gap-8 lg:gap-10">
        {projects.slice(0, 4).map((project, index) => (
            <div 
                key={index} 
                data-aos="fade-right" 
                data-aos-delay={index * 100} 
                data-aos-anchor-placement="top-center"
            >
                <ProjectCard {...project}  />
            </div>
        ))}
    </div>
    </div>
    </section>
  )
}
