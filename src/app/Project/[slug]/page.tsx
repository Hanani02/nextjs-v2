import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LuArrowLeft, LuExternalLink, LuGithub } from "react-icons/lu";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(isString) : [];
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;

  let projectData = null;
  let projectError = null;

  const slugQuery = await getSupabase()
    .from("project")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  projectData = slugQuery.data;
  projectError = slugQuery.error;

  if ((!projectData || projectError) && /^\d+$/.test(slug)) {
    const idQuery = await getSupabase()
      .from("project")
      .select("*")
      .eq("id", Number(slug))
      .maybeSingle();

    projectData = idQuery.data;
    projectError = idQuery.error;
  }

  if (projectError || !projectData) {
    notFound();
  }

  const { data: detailData } = await getSupabase()
    .from("detail")
    .select("*")
    .eq("id_project", projectData.id)
    .maybeSingle();

  const project = {
    slug: projectData.slug ?? String(projectData.id),
    title: projectData.judul_project ?? "Project",
    description: projectData.deskripsi_project ?? "",
    image: projectData.image ?? "/cv.png",
    tags: Array.isArray(projectData.tags)
      ? toStringArray(projectData.tags)
      : typeof projectData.tags === "string"
        ? projectData.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
        : [],
    kategori: projectData.kategori ?? "Web",
    liveUrl: projectData.live_url ?? projectData.live_URL ?? '',
    githubUrl: projectData.github_url ?? '',
  };

  const extraDetail = detailData
    ? {
        deskripsi: detailData.deskripsi,
        role: detailData.role,
        fitur: Array.isArray(detailData.fitur) ? detailData.fitur : [],
        teknologi: Array.isArray(detailData.teknologi)
          ? toStringArray(detailData.teknologi)
          : project.tags,
      }
    : null;

  const role = extraDetail?.role ?? (project.kategori.toLowerCase() === "ui/ux" ? "UI/UX Designer" : "Developer");
  const technologies = extraDetail?.teknologi ?? project.tags;

  return (
    <main className="min-h-screen py-24">
      <div className="mx-auto w-[90%] max-w-6xl space-y-10">
        <Link
          href="/Project"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-primary"
        >
          <LuArrowLeft className="h-4 w-4" />
          Kembali ke semua project
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr] lg:items-start">
          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border bg-surface/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Role saya</p>
              <h2 className="mt-3 text-xl font-semibold text-text">{role}</h2>
            </div>

            <div className="rounded-2xl border border-border bg-surface/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Teknologi</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(technologies ??[]).map((teknologi:string) => (
                  <span key={teknologi} className="rounded-md border border-border bg-primary/10 px-2.5 py-1.5 text-xs text-primary">
                    {teknologi}
                  </span>
                ))}
              </div>
            </div>

            {extraDetail?.fitur && extraDetail.fitur.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface/80 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Fitur</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-400">
                  {(extraDetail?.fitur ??[]).map((fitur:string) => (
                    <li key={fitur}>- {fitur}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <article className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block rounded-full border border-border bg-primary/10 px-4 py-1.5 text-sm text-primary">
                {project.kategori}
              </span>
              <h1 className="max-w-4xl text-4xl font-bold leading-tight text-text md:text-6xl">{project.title}</h1>
              <p className="max-w-3xl text-base leading-8 text-gray-400">
                {extraDetail?.deskripsi ?? project.description}
              </p>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-surface">
              <Image src={project.image} alt={project.title} fill className="object-cover" priority />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {project.liveUrl && (
                <Link
                  href={project.liveUrl}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-blue-400"
                >
                  Lihat project <LuExternalLink className="h-4 w-4" />
                </Link>
              )}
              {project.githubUrl && (
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
                >
                  Lihat Github <LuGithub className="h-4 w-4" />
                </Link>
              )}
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}