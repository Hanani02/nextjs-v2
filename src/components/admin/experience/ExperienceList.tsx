'use client';

import { LuPlus, LuBriefcase } from 'react-icons/lu';
import type { ExperienceItem } from '@/types/admin';
import ExperienceCard from './ExperienceCard';

interface ExperienceListProps {
  experiences: ExperienceItem[];
  onAddClick: () => void;
  onEditClick: (experience: ExperienceItem) => void;
  onDeleteClick: (experience: ExperienceItem) => void;
}

export default function ExperienceList({
  experiences,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: ExperienceListProps) {
  return (
    <div className="w-[90%] max-w-6xl mx-auto space-y-8">
      {/* Top Header & Add Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-semibold text-primary">
              <LuBriefcase className="w-3.5 h-3.5" />
              Tabel Supabase: experience
            </span>
            <span className="text-xs text-gray-400">Total: {experiences.length} Pengalaman</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mt-2">Kelola Experience & Karir</h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Data disimpan langsung di tabel Supabase <code className="text-primary font-mono">experience</code>.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background font-semibold text-xs md:text-sm hover:bg-blue-400 shadow-lg shadow-primary/25 transition cursor-pointer self-start sm:self-auto"
        >
          <LuPlus className="w-4 h-4" />
          <span>Tambah Experience</span>
        </button>
      </div>

      {/* List of Experiences */}
      {experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              onEdit={onEditClick}
              onDelete={onDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto text-gray-500">
            <LuBriefcase className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-text">Belum ada pengalaman tercatat</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Tambahkan riwayat karir, magang, atau posisi kepemimpinan Anda untuk ditampilkan di portofolio.
          </p>
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-background text-xs font-semibold hover:bg-blue-400 transition"
          >
            <LuPlus className="w-3.5 h-3.5" />
            Tambah Experience Pertama
          </button>
        </div>
      )}
    </div>
  );
}
