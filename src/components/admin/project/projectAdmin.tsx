'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { ProjectItem, ProjectFormData } from '@/types/admin';
import ProjectList from './ProjectList';
import AddProjectModal from './AddProjectModal';
import EditProjectModal from './EditProjectModal';
import DeleteProjectModal from './DeleteProjectModal';

interface ProjectAdminProps {
  projects: ProjectItem[];
  onRefresh: () => Promise<void>;
  onOpenDetailModal: (project: ProjectItem) => void;
  onImageUpload: (file: File, onSuccess: (url: string) => void) => Promise<void>;
  uploadingImage: boolean;
}

export default function ProjectAdmin({
  projects,
  onRefresh,
  onOpenDetailModal,
  onImageUpload,
  uploadingImage,
}: ProjectAdminProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectItem | null>(null);
  const [savingAction, setSavingAction] = useState(false);

  // 1. Handle Save Add Project
  const handleAddProject = async (formData: ProjectFormData) => {
    if (!formData.judul_project.trim()) {
      toast.error('Judul project wajib diisi!');
      return;
    }
    setSavingAction(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Project baru berhasil ditambahkan ke Supabase!');
        setIsAddOpen(false);
        await onRefresh();
      } else {
        toast.error(data.error || 'Gagal menambahkan project.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan project';
      toast.error(msg);
    } finally {
      setSavingAction(false);
    }
  };

  // 2. Handle Save Edit Project
  const handleEditProject = async (formData: ProjectFormData) => {
    if (!formData.id || !formData.judul_project.trim()) {
      toast.error('ID dan Judul project wajib diisi!');
      return;
    }
    setSavingAction(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Project berhasil diperbarui di Supabase!');
        setEditingProject(null);
        await onRefresh();
      } else {
        toast.error(data.error || 'Gagal memperbarui project.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui project';
      toast.error(msg);
    } finally {
      setSavingAction(false);
    }
  };

  // 3. Handle Confirm Delete Project
  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    setSavingAction(true);
    try {
      const res = await fetch(`/api/admin/projects?id=${deletingProject.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Project berhasil dihapus dari Supabase!');
        setDeletingProject(null);
        await onRefresh();
      } else {
        toast.error(data.error || 'Gagal menghapus project.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus project';
      toast.error(msg);
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <>
      <section
        id="projects-admin"
        className="relative py-24 border-b border-border/50 overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10 pointer-events-none" />
        <ProjectList
          projects={projects}
          onAddClick={() => setIsAddOpen(true)}
          onEditClick={(proj) => setEditingProject(proj)}
          onEditDetailClick={(proj) => onOpenDetailModal(proj)}
          onDeleteClick={(proj) => setDeletingProject(proj)}
        />
      </section>

      {/* Add Modal */}
      <AddProjectModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAddProject}
        onImageUpload={onImageUpload}
        uploadingImage={uploadingImage}
        savingAction={savingAction}
      />

      {/* Edit Modal */}
      <EditProjectModal
        isOpen={!!editingProject}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSave={handleEditProject}
        onImageUpload={onImageUpload}
        uploadingImage={uploadingImage}
        savingAction={savingAction}
      />

      {/* Delete Modal */}
      <DeleteProjectModal
        isOpen={!!deletingProject}
        project={deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteProject}
        savingAction={savingAction}
      />
    </>
  );
}
