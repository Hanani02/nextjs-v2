import SectionHeader from "@/components/ui/sectionHeader";
import ProjectBrowser, { type BrowserProject } from "@/components/project/ProjectBrowser";
import { getSupabase } from '@/lib/supabase';

export default async function projectSection() {
    const { data: daftarProyek, error } = await getSupabase()
        .from('project')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Supabase projectSection error:', error);
        return <p className="text-red-600">Gagal memuat data project: {error.message}</p>;
    }

    if (!daftarProyek || daftarProyek.length === 0) {
        return <p className="text-red-600">Data project kosong. Cek tabel project di Supabase dan policy RLS.</p>;
    }

    const projects: BrowserProject[] = (daftarProyek ?? []).map((project) => ({
        slug: project.slug ?? String(project.id),
        title: project.judul_project,
        description: project.deskripsi_project,
        image: project.image,
        tags: Array.isArray(project.tags) ? project.tags : (typeof project.tags === 'string' ? project.tags.split(',').map((tag: string) => tag.trim()) : []),
        kategori: project.kategori ?? 'web',
        liveUrl: project.live_url ?? project.live_URL ?? '',
        githubUrl: project.github_url ?? '',
    }));

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

                <ProjectBrowser projects={projects} limit={4} showViewAll />
            </div>
        </section>
    );
}
