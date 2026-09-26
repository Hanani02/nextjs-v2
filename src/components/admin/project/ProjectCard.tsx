'use client';

import Image from 'next/image';
import { LuPencil, LuTrash2, LuExternalLink, LuGithub, LuFileText } from 'react-icons/lu';
import type { ProjectItem } from '@/types/admin';

interface ProjectCardProps {
  project: ProjectItem;
  onEdit: (project: ProjectItem) => void;
  onEditDetail: (project: ProjectItem) => void;
  onDelete: (project: ProjectItem) => void;
}

export default function ProjectCard({
  project,
  onEdit,
  onEditDetail,
  onDelete,
}: ProjectCardProps) {
  const tagsList = Array.isArray(project.tags)
    ? project.tags
    : typeof project.tags === 'string'
    ? (project.tags as string).split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card/80 shadow-lg transition-all duration-300 hover:border-primary/50">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-surface">
        <Image
          fill
          src={project.image || '/image/auroraweb.png'}
          alt={project.judul_project}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute top-3 left-3">
          <span className="rounded-md border border-border bg-background/80 px-2.5 py-1 text-[11px] font-medium text-primary backdrop-blur-md">
            {project.kategori || 'web'}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md border border-border bg-background/90 px-2 py-1 text-[11px] text-gray-400 backdrop-blur-md">
          <span>ID: {project.id}</span>
        </div>
      </div>

      {/* Info Content */}
      <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-bold text-text group-hover:text-primary transition-colors">
              {project.judul_project}
            </h3>
            <span className="shrink-0 font-mono text-[10px] text-gray-500 bg-surface px-1.5 py-0.5 rounded border border-border">
              /{project.slug}
            </span>
          </div>

          <p className="line-clamp-2 text-xs leading-relaxed text-gray-400">
            {project.deskripsi_project}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 pt-1">
            {tagsList.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Links & Action Controls */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-2">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                title="Buka Live URL"
              >
                <LuExternalLink className="h-3 w-3" />
                <span>Demo</span>
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-text"
                title="Buka Repositori GitHub"
              >
                <LuGithub className="h-3 w-3" />
                <span>Repo</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Edit Detail Button */}
            <button
              type="button"
              onClick={() => onEditDetail(project)}
              className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/20 transition cursor-pointer"
              title="Edit Detail Project (Tabel detail)"
            >
              <LuFileText className="h-3 w-3" />
              <span>Detail</span>
            </button>

            {/* Edit Project Button */}
            <button
              type="button"
              onClick={() => onEdit(project)}
              className="rounded-lg border border-border bg-surface p-1.5 text-gray-300 transition hover:border-primary hover:text-primary cursor-pointer"
              title="Edit Project"
            >
              <LuPencil className="h-3.5 w-3.5" />
            </button>

            {/* Delete Project Button */}
            <button
              type="button"
              onClick={() => onDelete(project)}
              className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 transition hover:bg-red-500/20 cursor-pointer"
              title="Hapus Project"
            >
              <LuTrash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
