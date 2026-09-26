'use client';

import { useState, useMemo } from 'react';
import { LuPlus, LuLayers, LuSearch, LuFilter } from 'react-icons/lu';
import type { ProjectItem } from '@/types/admin';
import ProjectCard from './ProjectCard';

interface ProjectListProps {
  projects: ProjectItem[];
  onAddClick: () => void;
  onEditClick: (project: ProjectItem) => void;
  onEditDetailClick: (project: ProjectItem) => void;
  onDeleteClick: (project: ProjectItem) => void;
}

export default function ProjectList({
  projects,
  onAddClick,
  onEditClick,
  onEditDetailClick,
  onDeleteClick,
}: ProjectListProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.kategori) set.add(p.kategori);
    });
    return Array.from(set);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchCat =
        selectedCategory === 'all' ||
        p.kategori?.toLowerCase() === selectedCategory.toLowerCase();

      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.judul_project.toLowerCase().includes(q) ||
        p.deskripsi_project.toLowerCase().includes(q) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q)));

      return matchCat && matchSearch;
    });
  }, [projects, selectedCategory, search]);

  return (
    <div className="w-[90%] max-w-6xl mx-auto space-y-8">
      {/* Top Header & Add Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-semibold text-primary">
              <LuLayers className="w-3.5 h-3.5" />
              Tabel Supabase: project & detail
            </span>
            <span className="text-xs text-gray-400">Total: {projects.length} Project</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mt-2">Kelola Project Portofolio</h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Data disimpan langsung ke tabel Supabase <code className="text-primary font-mono">project</code> dan relasi <code className="text-primary font-mono">detail</code>.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background font-semibold text-xs md:text-sm hover:bg-blue-400 shadow-lg shadow-primary/25 transition cursor-pointer self-start sm:self-auto"
        >
          <LuPlus className="w-4 h-4" />
          <span>Tambah Project Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl bg-surface/60 border border-border">
        {/* Search */}
        <div className="relative flex-1">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, tag, atau deskripsi project..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border/80 text-xs text-text placeholder-gray-500 outline-none focus:border-primary transition"
          />
        </div>

        {/* Categories Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-primary text-background font-semibold'
                : 'bg-card text-gray-400 hover:text-text hover:bg-card/80 border border-border'
            }`}
          >
            Semua ({projects.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 capitalize ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-primary text-background font-semibold'
                  : 'bg-card text-gray-400 hover:text-text hover:bg-card/80 border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              onEdit={onEditClick}
              onEditDetail={onEditDetailClick}
              onDelete={onDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto text-gray-500">
            <LuLayers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-text">Belum ada project ditemukan</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {search || selectedCategory !== 'all'
              ? 'Tidak ada project yang cocok dengan kriteria pencarian Anda.'
              : 'Belum ada data project di tabel Supabase. Klik tombol di bawah untuk menambah project pertama Anda.'}
          </p>
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-background text-xs font-semibold hover:bg-blue-400 transition"
          >
            <LuPlus className="w-3.5 h-3.5" />
            Tambah Project
          </button>
        </div>
      )}
    </div>
  );
}
