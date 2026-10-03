import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://portofolio-hanan.vercel.app";
  const now = new Date();

  // Static pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/Project`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const { data: projects, error } = await getSupabase()
      .from("project")
      .select("id, slug, created_at")
      .order("id", { ascending: false });

    if (!error && projects) {
      for (const p of projects) {
        const identifier = p.slug || String(p.id);
        const lastMod = p.created_at ? new Date(p.created_at) : now;

        routes.push({
          url: `${baseUrl}/Project/${identifier}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.8,
        });

        // Also map /proyek/:id for Indonesian alias
        routes.push({
          url: `${baseUrl}/proyek/${p.id}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch (err) {
    console.error("Error generating dynamic sitemap:", err);
  }

  return routes;
}
