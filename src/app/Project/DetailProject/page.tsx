import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface DetailProjectPageProps {
  searchParams?: Promise<{ slug?: string; id?: string }>;
}

export default async function DetailProjectPage({ searchParams }: DetailProjectPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const target = resolvedParams.slug || resolvedParams.id;

  if (target) {
    redirect(`/Project/${target}`);
  }

  // Fallback: If no query param, fetch the first project from Supabase or redirect to /Project
  const { data } = await getSupabase()
    .from("project")
    .select("slug, id")
    .limit(1)
    .maybeSingle();

  if (data?.slug) {
    redirect(`/Project/${data.slug}`);
  }

  redirect("/Project");
}