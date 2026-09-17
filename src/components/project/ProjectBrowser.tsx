"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LuArrowRight, LuSearch } from "react-icons/lu";
import ProjectCard from "@/components/project/ProjectCard";

export type BrowserProject = {
  slug: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  kategori: string;
  liveUrl?: string;
  githubUrl?: string;
};

type ProjectBrowserProps = {
  projects: BrowserProject[];
  initialCategory?: string;
  initialSearch?: string;
  limit?: number;
  showViewAll?: boolean;
};

const categories = ["Semua", "Web", "Mobile", "IoT", "UI/UX"];

export default function ProjectBrowser({
  projects,
  initialCategory = "",
  initialSearch = "",
  limit,
  showViewAll = false,
}: ProjectBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedCategory = category.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesCategory =
        !normalizedCategory ||
        normalizedCategory === "semua" ||
        project.kategori.toLowerCase() === normalizedCategory;
      const searchableText = [
        project.title,
        project.description,
        project.kategori,
        ...project.tags,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [category, projects, search]);

  const visibleProjects = limit ? filteredProjects.slice(0, limit) : filteredProjects;

  function updateQuery(nextCategory: string, nextSearch: string) {
    const params = new URLSearchParams();
    if (nextCategory && nextCategory !== "Semua") {
      params.set("category", nextCategory.toLowerCase());
    }
    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleCategoryChange(nextCategory: string) {
    setCategory(nextCategory === "Semua" ? "" : nextCategory);
    updateQuery(nextCategory, search);
  }

  function handleSearchChange(nextSearch: string) {
    setSearch(nextSearch);
    updateQuery(category, nextSearch);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-y border-border py-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-sm">
          <div className="flex w-full items-center rounded-lg border border-border bg-surface/70 px-3 transition focus-within:border-primary">
            <LuSearch
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-gray-400"
            />
            <input
              type="text"
              aria-label="Cari project"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Cari project..."
              className="min-w-0 flex-1 bg-transparent py-2.5 pl-3 pr-1 text-sm text-text outline-none placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((item) => {
            const isActive = item === "Semua" ? !category : category.toLowerCase() === item.toLowerCase();
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleCategoryChange(item)}
                className={`rounded-lg border px-4 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "border-primary bg-primary text-background shadow-sm"
                    : "border-border bg-surface/70 text-gray-300 hover:border-primary hover:text-primary"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-gray-400">
        Menampilkan {visibleProjects.length} dari {filteredProjects.length} project yang cocok.
      </p>

      {visibleProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
          {visibleProjects.map((project, index) => (
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
      ) : (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-gray-400">
          Project tidak ditemukan. Coba kata kunci atau kategori lain.
        </div>
      )}

      {showViewAll && (
        <div className="flex justify-end">
          <Link
            href="/Project"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
          >
            Lihat lebih lengkap <LuArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
