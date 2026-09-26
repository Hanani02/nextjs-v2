'use client';

import { LuPencil, LuTrash2 } from 'react-icons/lu';
import type { ExperienceItem } from '@/types/admin';

interface ExperienceCardProps {
  experience: ExperienceItem;
  onEdit: (experience: ExperienceItem) => void;
  onDelete: (experience: ExperienceItem) => void;
}

export default function ExperienceCard({
  experience,
  onEdit,
  onDelete,
}: ExperienceCardProps) {
  const techList = Array.isArray(experience.technologies)
    ? experience.technologies
    : typeof experience.technologies === 'string'
    ? (experience.technologies as string).split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="p-5 rounded-2xl border border-border bg-card/80 hover:border-primary/40 transition flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-md">
      <div className="space-y-2 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
            {experience.period}
          </span>
          <span className="text-xs text-gray-500 font-mono">ID: {experience.id}</span>
        </div>

        <h3 className="text-lg font-bold text-text">{experience.role}</h3>
        <p className="text-sm font-medium text-gray-400">{experience.company}</p>
        <p className="text-xs text-gray-400 leading-relaxed max-w-3xl whitespace-pre-line">
          {experience.descriptions}
        </p>

        {/* Technologies Stack */}
        {techList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {techList.map((tech, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 bg-surface text-gray-300 text-[10px] rounded-full border border-border font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 self-end md:self-start shrink-0">
        <button
          type="button"
          onClick={() => onEdit(experience)}
          className="p-2 rounded-xl border border-border bg-surface text-gray-300 hover:text-primary hover:border-primary transition cursor-pointer"
          title="Edit Experience"
        >
          <LuPencil className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(experience)}
          className="p-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition cursor-pointer"
          title="Hapus Experience"
        >
          <LuTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
