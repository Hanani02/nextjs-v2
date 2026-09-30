import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LuArrowLeft,
  LuExternalLink,
  LuGithub,
  LuUserCheck,
  LuLayers,
  LuCircleCheck,
  LuFileText,
  LuSparkles,
} from "react-icons/lu";
import { getSupabase } from "@/lib/supabase";
import { resolveImageUrl } from "@/lib/utils";

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

  if (!slug) {
    notFound();
  }

  let projectData = null;
  let projectError = null;

  // 1. Query by slug from Supabase
  const slugQuery = await getSupabase()
    .from("project")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  projectData = slugQuery.data;
  projectError = slugQuery.error;

  // 2. Fallback: query by ID if slug is a number
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

  // 3. Query detail from Supabase table 'detail' (FK id_project)
  const { data: detailData } = await getSupabase()
    .from("detail")
    .select("*")
    .eq("id_project", projectData.id)
    .maybeSingle();

  const project = {
    id: projectData.id,
    slug: projectData.slug ?? String(projectData.id),
    title: projectData.judul_project ?? "Project",
    description: projectData.deskripsi_project ?? "",
    image: resolveImageUrl(projectData.image, "/image/auroraweb.png"),
    tags: Array.isArray(projectData.tags)
      ? toStringArray(projectData.tags)
      : typeof projectData.tags === "string"
        ? projectData.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
        : [],
    kategori: projectData.kategori ?? "Web",
    liveUrl: projectData.live_url ?? '',
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

  const role = extraDetail?.role || (project.kategori.toLowerCase() === "ui/ux" ? "UI/UX Designer" : "Fullstack Developer");
  const technologies = (extraDetail?.teknologi && extraDetail.teknologi.length > 0)
    ? extraDetail.teknologi
    : project.tags;
  const features = extraDetail?.fitur ?? [];

  return (
    <main className="min-h-screen pt-28 md:pt-36 pb-24 bg-background text-text selection:bg-primary/20 selection:text-primary">
      {/* Background radial glow */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto w-[92%] max-w-6xl space-y-8">
        {/* Top Breadcrumb & Category Badge */}
        <div className="flex items-center justify-between">
          <Link
            href="/Project"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-400 transition hover:text-primary bg-card/80 border border-border px-3.5 py-2 rounded-xl backdrop-blur-sm"
          >
            <LuArrowLeft className="h-4 w-4" />
            <span>Kembali ke Semua Project</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary">
            <LuSparkles className="w-3.5 h-3.5" />
            {project.kategori}
          </span>
        </div>


        <div className="project-detail-grid">
          
          <aside className="project-detail-left space-y-5 md:sticky md:top-28">
            {/* 1. Card: Role Saya */}
            <div className="rounded-2xl border border-border bg-card/90 p-5 shadow-lg space-y-2.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-primary">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                  <LuUserCheck className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Role Saya
                </span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-text break-words">
                {role}
              </h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Tanggung jawab implementasi dan arsitektur project.
              </p>
            </div>

            {/* 2. Card: Teknologi & Tools */}
            <div className="rounded-2xl border border-border bg-card/90 p-5 shadow-lg space-y-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                    <LuLayers className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Teknologi
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                  {technologies.length} item
                </span>
              </div>

              {technologies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {technologies.map((tech: string, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-border/90 bg-surface/90 px-2.5 py-1 text-xs text-gray-200 font-medium hover:border-primary/50 transition break-words"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">Belum ada data teknologi.</p>
              )}
            </div>

            {/* 3. Card: Fitur-Fitur Utama */}
            <div className="rounded-2xl border border-border bg-card/90 p-5 shadow-lg space-y-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                    <LuCircleCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Fitur Utama
                  </span>
                </div>
                {features.length > 0 && (
                  <span className="text-[10px] text-gray-500 font-mono">
                    {features.length} fitur
                  </span>
                )}
              </div>

              {features.length > 0 ? (
                <ul className="space-y-2 pt-1">
                  {features.map((fitur: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-gray-300 leading-relaxed bg-surface/50 border border-border/50 p-2.5 rounded-xl break-words"
                    >
                      <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                        ✓
                      </span>
                      <span className="flex-1 break-words">{fitur}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 rounded-xl bg-surface/40 border border-dashed border-border text-center">
                  <p className="text-xs text-gray-400">
                    Fitur detail belum ditambahkan di tabel detail Supabase.
                  </p>
                </div>
              )}
            </div>
          </aside>

          <article className="project-detail-right space-y-6">
            {/* Title & Metadata */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-text tracking-tight break-words">
                {project.title}
              </h1>
            </div>

            {/* Thumbnail / Image Preview */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl group">
              <Image
                src={project.image || "/image/auroraweb.png"}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
            </div>

            {/* Action Links (Live Demo & GitHub Repo) */}
            <div className="flex flex-wrap items-center gap-3">
              {project.liveUrl && (
                <Link
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs md:text-sm font-semibold text-background transition hover:bg-blue-400 shadow-lg shadow-primary/25 cursor-pointer"
                >
                  <LuExternalLink className="h-4 w-4" />
                  <span>Kunjungi Live Website</span>
                </Link>
              )}

              {project.githubUrl && (
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-xs md:text-sm font-semibold text-text transition hover:border-primary hover:text-primary cursor-pointer shadow"
                >
                  <LuGithub className="h-4 w-4" />
                  <span>Repositori GitHub</span>
                </Link>
              )}
            </div>

            {/* Deskripsi Project Card */}
            <div className="rounded-2xl border border-border bg-card/90 p-6 md:p-8 shadow-lg space-y-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-border pb-3 text-text">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                  <LuFileText className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold">Tentang &amp; Deskripsi Project</h2>
              </div>

              {/* Extra detail deskripsi or main project description */}
              {extraDetail?.deskripsi ? (
                <div className="space-y-4 text-xs md:text-sm leading-relaxed text-gray-300">
                  <div className="whitespace-pre-line leading-relaxed">
                    {extraDetail.deskripsi}
                  </div>
                  {project.description && project.description !== extraDetail.deskripsi && (
                    <div className="pt-3 border-t border-border/50 text-gray-400 text-xs leading-relaxed italic">
                      {project.description}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs md:text-sm leading-relaxed text-gray-300 whitespace-pre-line">
                  {project.description || "Belum ada deskripsi untuk project ini."}
                </p>
              )}
            </div>
          </article>

        </div>
      </div>
    </main>
  );
}
