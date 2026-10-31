"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import {
  LuArrowRight,
  LuSearch,
  LuSlidersHorizontal,
  LuCheck,
  LuX,
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "@/components/project/ProjectCard";
import AnimatedDeleteButton from "@/components/project/AnimatedDeleteButton";
import { useLanguage } from "@/context/LanguageContext";

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
  const { dictionary, isId } = useLanguage();
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedCategory = category.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesCategory =
        !normalizedCategory ||
        normalizedCategory === "semua" ||
        project.kategori.toLowerCase() === normalizedCategory;

      if (!matchesCategory) return false;

      if (!normalizedSearch) return true;

      const searchableText = [
        project.title,
        project.description,
        project.kategori,
        ...(Array.isArray(project.tags) ? project.tags : []),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
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

  const isFiltered = Boolean(category && category !== "Semua");

  return (
    <div className="space-y-8">
      {/* Search Bar & Filter Header */}
      <div className="py-4 space-y-3">
        <div className="flex items-center gap-3 w-full">
          {/* Panjang Search Bar (Full Width) */}
          <div className="relative flex-1 flex items-center rounded-2xl border border-border bg-surface/80 px-3.5 py-1 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm">
            <LuSearch
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-gray-400 mr-2.5"
            />
            <input
              type="text"
              aria-label="Cari project"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={dictionary.projects_search_placeholder}
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-text outline-none placeholder:text-gray-500"
            />

            {/* Tombol Delete Otomatis dengan Animasi Tempat Sampah */}
            <AnimatePresence>
              {search.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 pl-2"
                >
                  <AnimatedDeleteButton onClear={() => handleSearchChange("")} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logo Filter di sebelah kanan search bar */}
          <div className="relative shrink-0" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              aria-expanded={isFilterOpen}
              aria-label="Filter kategori project"
              className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all cursor-pointer select-none shadow-sm ${
                isFilterOpen || isFiltered
                  ? "border-primary bg-primary/10 text-primary shadow-primary/10"
                  : "border-border bg-surface/80 text-text/80 hover:border-primary hover:text-primary"
              }`}
            >
              <LuSlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isFiltered ? category : isId ? "Filter" : "Filter"}
              </span>
              {isFiltered && (
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>

            {/* Menu Popover / Dropdown Kategori */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 z-40 w-56 rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-xl space-y-1"
                >
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-border/60 flex items-center justify-between">
                    <span>{isId ? "Kategori Project" : "Project Categories"}</span>
                    {isFiltered && (
                      <button
                        type="button"
                        onClick={() => {
                          handleCategoryChange("Semua");
                          setIsFilterOpen(false);
                        }}
                        className="text-[10px] text-primary hover:underline font-medium lowercase"
                      >
                        reset
                      </button>
                    )}
                  </div>

                  <div className="pt-1 space-y-0.5">
                    {categories.map((item) => {
                      const displayLabel = item === "Semua" ? dictionary.projects_filter_all : item;
                      const isSelected = item === "Semua" ? !category : category.toLowerCase() === item.toLowerCase();
                      const count = item === "Semua"
                        ? projects.length
                        : projects.filter(
                            (p) => p.kategori && p.kategori.toLowerCase() === item.toLowerCase()
                          ).length;

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            handleCategoryChange(item);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? "bg-primary text-white shadow-sm"
                              : "text-text/80 hover:bg-surface hover:text-text"
                          }`}
                        >
                          <span>{displayLabel}</span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-surface text-gray-400 border border-border/60"
                              }`}
                            >
                              {count}
                            </span>
                            {isSelected && <LuCheck className="h-3.5 w-3.5 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Indikator Filter Aktif */}
        {isFiltered && (
          <div className="flex items-center gap-2 pt-1 text-xs text-gray-400">
            <span>{isId ? "Filter aktif:" : "Active filter:"}</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-primary font-medium text-xs">
              {category}
              <button
                type="button"
                onClick={() => handleCategoryChange("Semua")}
                className="hover:text-red-400 transition cursor-pointer"
                aria-label="Hapus filter kategori"
              >
                <LuX className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-400">
        {isId
          ? `Menampilkan ${visibleProjects.length} dari ${filteredProjects.length} proyek yang cocok.`
          : `Showing ${visibleProjects.length} of ${filteredProjects.length} matching projects.`}
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
          {dictionary.projects_empty}
        </div>
      )}

      {showViewAll && (
        <div className="flex justify-end">
          <Link
            href="/Project"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
          >
            {dictionary.projects_view_all} <LuArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
