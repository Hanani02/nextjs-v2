import Link from "next/link";
import ProjectCard from "@/components/project/ProjectCard";
import { LuArrowRight } from "react-icons/lu";
import Footer from '@/section/Footer';
import { supabase } from '@/lib/supabase';

interface ProjectPageProps {
    searchParams: Promise<{ category?: string }>;
}

export default async function ProjectsPage({ searchParams }: ProjectPageProps) {
    const { category } = await searchParams;

    const { data: projectData, error } = await supabase
        .from('project')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Supabase ProjectsPage error:', error);
        return <p className="text-red-600">Gagal memuat data: {error.message}</p>;
    }

    if (!projectData || projectData.length === 0) {
        return <p className="text-red-600">Data project kosong. Cek apakah tabel project ada dan policy RLS mengizinkan select.</p>;
    }

    const projects = (projectData ?? []).map((project) => ({
        slug: project.slug ?? String(project.id),
        title: project.judul_project,
        description: project.deskripsi_project,
        image: project.image,
        tags: Array.isArray(project.tags) ? project.tags : (typeof project.tags === 'string' ? project.tags.split(',').map((tag: string) => tag.trim()) : []),
        kategori: project.kategori ?? 'web',
        liveUrl: project.live_url ?? project.live_URL ?? '',
        githubUrl: project.github_url ?? '',
    }));

    const filtered = category
        ? projects.filter((p) => p.kategori.toLowerCase() === category.toLowerCase())
        : projects;

    const categories = ['Semua', 'Web', 'Mobile', 'IoT', 'UI/UX'];

    return (
        <div className="flex min-h-screen flex-col">
        <main className="flex-1 pt-24 pb-12">
            <div className="mx-auto w-[90%] max-w-6xl space-y-12 pb-10">
                <div className="grid grid-cols-1 items-end gap-8 border-b border-border pb-10 lg:grid-cols-[1fr_auto]">
                    <div className="space-y-5">
                        <span className="inline-block rounded-full border border-border bg-primary/10 px-4 py-1.5 text-sm text-primary">
                            Projects
                        </span>
                        <h1 className="max-w-2xl text-4xl font-bold leading-tight text-text md:text-6xl">
                            Kumpulan karya yang pernah saya buat.
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
                            Jelajahi semua project yang saya bangun untuk belajar, bereksperimen, dan menciptakan pengalaman digital yang lebih baik.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface/70 px-8 py-6 lg:min-w-44 lg:text-right">
                        <p className="text-center text-sm text-gray-400">Total project</p>
                        <p className="mt-1 text-center text-5xl font-bold text-primary">{projects.length}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => {
                            const isAll = cat === 'Semua';
                            const href = isAll ? '/Project' : `/Project?category=${encodeURIComponent(cat.toLowerCase())}`;
                            const isActive = isAll ? !category : category?.toLowerCase() === cat.toLowerCase();
                            return (
                                <Link
                                    key={cat}
                                    href={href}
                                    className={`rounded-lg border px-4 py-1.5 text-xs font-semibold transition ${
                                        isActive ? 'border-primary bg-primary text-background shadow-sm' : 'border-border bg-surface/70 text-gray-300 hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    {cat}
                                </Link>
                            );
                        })}
                    </div>
                    <Link
                        href="/#projects"
                        className="inline-flex items-center gap-2 self-start rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text transition hover:border-primary hover:text-primary sm:self-auto"
                    >
                        Kembali ke home <LuArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
                    {filtered.map((project, index) => (
                        <div
                            key={project.slug}
                            data-aos="fade-right"
                            data-aos-delay={index * 100}
                            data-aos-anchor-placement="top-center"
                        >
                            <ProjectCard {...project} />
                        </div>
                    ))}
                </div>
            </div>
        </main>
      <Footer />
    </div>
    );
}
