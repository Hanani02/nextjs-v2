import ProjectBrowser, { type BrowserProject } from "@/components/project/ProjectBrowser";
import ProjectPageHeader from "@/components/project/ProjectPageHeader";
import Footer from '@/components/section/Footer';
import { getSupabase } from '@/lib/supabase';
import { resolveImageUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface ProjectPageProps {
    searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function ProjectsPage({ searchParams }: ProjectPageProps) {
    const { category, search } = await searchParams;

    const { data: projectData, error } = await getSupabase()
        .from('project')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Supabase ProjectsPage error:', error);
        return <p className="text-red-600">Gagal memuat data: {error.message}</p>;
    }

    if (!projectData || projectData.length === 0) {
        return <p className="text-red-600">Data project kosong. Cek apakah tabel project ada dan policy RLS mengizinkan select.</p>;
    }

    const projects: BrowserProject[] = (projectData ?? []).map((project) => ({
        slug: project.slug ?? String(project.id),
        title: project.judul_project,
        description: project.deskripsi_project,
        image: resolveImageUrl(project.image, '/image/auroraweb.png'),
        tags: Array.isArray(project.tags) ? project.tags : (typeof project.tags === 'string' ? project.tags.split(',').map((tag: string) => tag.trim()) : []),
        kategori: project.kategori ?? 'web',
        liveUrl: project.live_url ?? project.live_URL ?? '',
        githubUrl: project.github_url ?? '',
    }));

    return (
        <div className="flex min-h-screen flex-col">
        <main className="flex-1 pt-24 pb-12">
            <div className="mx-auto w-[90%] max-w-6xl space-y-12 pb-10">
                <ProjectPageHeader totalProjects={projects.length} />

                <ProjectBrowser projects={projects} initialCategory={category} initialSearch={search} />
            </div>
        </main>
      <Footer />
    </div>
    );
}
