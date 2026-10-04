import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site-url";

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
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
      .select("id, slug")
      .order("id", { ascending: false });

    if (!error && projects) {
      for (const p of projects) {
        const identifier = p.slug || String(p.id);

        routes.push({
          url: `${baseUrl}/Project/${identifier}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    } else if (error) {
      console.error("Supabase sitemap query error:", error.message);
    }
  } catch (err) {
    console.error("Error generating dynamic sitemap:", err);
  }

  return routes;
}
