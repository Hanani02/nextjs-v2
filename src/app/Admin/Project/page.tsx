'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LuArrowLeft, LuLoader, LuShieldCheck } from 'react-icons/lu';
import { toast, Toaster } from 'react-hot-toast';
import type { ProjectItem, DetailFormData } from '@/types/admin';
import ProjectAdmin from '@/components/admin/project/projectAdmin';
import DetailAdmin from '@/components/admin/detail/detailAdmin';

interface ProjectPageProps {
  projects?: ProjectItem[];
  onRefresh?: () => Promise<void>;
  onOpenDetailModal?: (project: ProjectItem) => void;
  onImageUpload?: (file: File, onSuccess: (url: string) => void) => Promise<void>;
  uploadingImage?: boolean;
}

export default function AdminProjectPage(props: ProjectPageProps) {
  // If props are passed from main Admin page
  const isEmbedded = !!props.projects;

  // Local states for standalone route usage (/Admin/Project)
  const [localProjects, setLocalProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(!isEmbedded);
  const [localUploading, setLocalUploading] = useState(false);
  const [activeDetailProject, setActiveDetailProject] = useState<DetailFormData | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/projects');
      const data = await res.json();
      if (data.success && data.data) {
        setLocalProjects(data.data);
      }
    } catch {
      toast.error('Gagal memuat data project.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isEmbedded) {
      fetchProjects();
    }
  }, [isEmbedded]);

  // Local image upload handler
  const handleLocalImageUpload = async (file: File, onSuccess: (url: string) => void) => {
    setLocalUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        onSuccess(data.url);
        toast.success('Foto berhasil diunggah!');
      } else {
        toast.error(data.error || 'Gagal mengunggah foto.');
      }
    } catch {
      toast.error('Gagal mengunggah foto.');
    } finally {
      setLocalUploading(false);
    }
  };

  // Local detail modal opener
  const handleOpenDetail = async (project: ProjectItem) => {
    if (props.onOpenDetailModal) {
      props.onOpenDetailModal(project);
      return;
    }

    setActiveDetailProject({
      id_project: project.id,
      projectTitle: project.judul_project,
      role: project.kategori.toLowerCase() === 'ui/ux' ? 'UI/UX Designer' : 'Fullstack Developer',
      deskripsi: project.deskripsi_project,
      fitur: '',
      teknologi: Array.isArray(project.tags) ? project.tags.join(', ') : '',
    });

    try {
      const res = await fetch(`/api/admin/detail?id_project=${project.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        setActiveDetailProject({
          id_project: project.id,
          projectTitle: project.judul_project,
          role: d.role || '',
          deskripsi: d.deskripsi || '',
          fitur: Array.isArray(d.fitur) ? d.fitur.join('\n') : '',
          teknologi: Array.isArray(d.teknologi) ? d.teknologi.join(', ') : '',
        });
      }
    } catch (err) {
      console.warn('Failed to load detail for project:', err);
    }
  };

  const projectList = props.projects ?? localProjects;
  const refreshHandler = props.onRefresh ?? fetchProjects;
  const uploadHandler = props.onImageUpload ?? handleLocalImageUpload;
  const isUploading = props.uploadingImage ?? localUploading;

  if (isEmbedded) {
    return (
      <ProjectAdmin
        projects={projectList}
        onRefresh={refreshHandler}
        onOpenDetailModal={handleOpenDetail}
        onImageUpload={uploadHandler}
        uploadingImage={isUploading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <Toaster position="top-right" />
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border shadow-lg py-3 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/Admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-primary transition"
          >
            <LuArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-gray-400">Tabel: project & detail</span>
          </div>
        </div>
      </header>

      <main className="py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-sm text-gray-400">
            <LuLoader className="w-5 h-5 animate-spin text-primary" />
            <span>Memuat data project dari Supabase...</span>
          </div>
        ) : (
          <ProjectAdmin
            projects={projectList}
            onRefresh={refreshHandler}
            onOpenDetailModal={handleOpenDetail}
            onImageUpload={uploadHandler}
            uploadingImage={isUploading}
          />
        )}
      </main>

      {/* Standalone Detail Modal */}
      <DetailAdmin
        isOpen={!!activeDetailProject}
        detailData={activeDetailProject}
        onClose={() => setActiveDetailProject(null)}
        onSuccess={refreshHandler}
      />
    </div>
  );
}
