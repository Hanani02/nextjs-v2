import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { resolveImageUrl } from "@/lib/utils";
import { SITE_URL } from "@/lib/site-url";
import ProjectDetailPage from "@/app/Project/[slug]/page";

export const dynamic = "force-dynamic";

interface ProyekDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProyekDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!id) {
    return {
      title: "Proyek Tidak Ditemukan",
    };
  }

  // 1. Query by ID if numeric
  let project = null;
  if (/^\d+$/.test(id)) {
    const { data } = await getSupabase()
      .from("project")
      .select("id, slug, judul_project, deskripsi_project, image, kategori, tags")
      .eq("id", Number(id))
      .maybeSingle();
    project = data;
  }

  // 2. Fallback query by slug
  if (!project) {
    const { data } = await getSupabase()
      .from("project")
      .select("id, slug, judul_project, deskripsi_project, image, kategori, tags")
      .eq("slug", id)
      .maybeSingle();
    project = data;
  }

  if (!project) {
    return {
      title: "Proyek Tidak Ditemukan | Muhammad Akbar Hanani",
      description: "Proyek yang Anda cari tidak dapat ditemukan.",
    };
  }

  const title = project.judul_project || "Detail Proyek";
  const description =
    project.deskripsi_project ||
    `Detail proyek ${title} yang dikembangkan oleh Muhammad Akbar Hanani.`;
  const image = resolveImageUrl(project.image, "/image/auroraweb.png");
  const canonicalUrl = `${SITE_URL}/proyek/${project.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Muhammad Akbar Hanani`,
      description,
      url: canonicalUrl,
      type: "article",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Muhammad Akbar Hanani`,
      description,
      images: [image],
    },
  };
}

export default async function ProyekPage({ params }: ProyekDetailPageProps) {
  const { id } = await params;
  // Delegate to ProjectDetailPage using the id / slug param
  return <ProjectDetailPage params={Promise.resolve({ slug: id })} />;
}
