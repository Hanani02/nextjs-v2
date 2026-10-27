"use client";

import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

export default function ProjectPageHeader({ totalProjects }: { totalProjects: number }) {
  const { dictionary } = useLanguage();

  return (
    <>
      <div className="grid grid-cols-1 items-end gap-8 border-b border-border pb-10 lg:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          <span className="inline-block rounded-full border border-border bg-primary/10 px-4 py-1.5 text-sm text-primary font-semibold">
            {dictionary.projects_badge}
          </span>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-text md:text-6xl">
            {dictionary.projects_header_title}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
            {dictionary.projects_header_desc}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface/70 px-8 py-6 lg:min-w-44 lg:text-right shadow-sm">
          <p className="text-center text-sm text-gray-400 lg:text-right">{dictionary.projects_total}</p>
          <p className="text-center text-4xl font-bold text-primary lg:text-right">
            {totalProjects}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 self-start rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text transition hover:border-primary hover:text-primary sm:self-auto"
        >
          {dictionary.projects_back_home} <LuArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}

