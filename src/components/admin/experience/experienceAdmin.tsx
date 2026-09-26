'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { ExperienceItem, ExperienceFormData } from '@/types/admin';
import ExperienceList from './ExperienceList';
import AddExperienceModal from './AddExperienceModal';
import EditExperienceModal from './EditExperienceModal';
import DeleteExperienceModal from './DeleteExperienceModal';

interface ExperienceAdminProps {
  experiences: ExperienceItem[];
  onRefresh: () => Promise<void>;
}

export default function ExperienceAdmin({
  experiences,
  onRefresh,
}: ExperienceAdminProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null);
  const [deletingExperience, setDeletingExperience] = useState<ExperienceItem | null>(null);
  const [savingAction, setSavingAction] = useState(false);

  // 1. Save Add
  const handleAddExperience = async (formData: ExperienceFormData) => {
    if (!formData.role.trim() || !formData.company.trim()) {
      toast.error('Role dan Company wajib diisi!');
      return;
    }
    setSavingAction(true);
    try {
      const res = await fetch('/api/admin/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Experience baru berhasil ditambahkan!');
        setIsAddOpen(false);
        await onRefresh();
      } else {
        toast.error(data.error || 'Gagal menambahkan experience.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan experience';
      toast.error(msg);
    } finally {
      setSavingAction(false);
    }
  };

  // 2. Save Edit
  const handleEditExperience = async (formData: ExperienceFormData) => {
    if (!formData.id || !formData.role.trim() || !formData.company.trim()) {
      toast.error('ID, Role dan Company wajib diisi!');
      return;
    }
    setSavingAction(true);
    try {
      const res = await fetch('/api/admin/experience', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Experience berhasil diperbarui!');
        setEditingExperience(null);
        await onRefresh();
      } else {
        toast.error(data.error || 'Gagal memperbarui experience.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui experience';
      toast.error(msg);
    } finally {
      setSavingAction(false);
    }
  };

  // 3. Confirm Delete
  const handleDeleteExperience = async () => {
    if (!deletingExperience) return;
    setSavingAction(true);
    try {
      const res = await fetch(`/api/admin/experience?id=${deletingExperience.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Experience berhasil dihapus!');
        setDeletingExperience(null);
        await onRefresh();
      } else {
        toast.error(data.error || 'Gagal menghapus experience.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus experience';
      toast.error(msg);
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <>
      <section
        id="experience-admin"
        className="relative py-24 border-b border-border/50 overflow-hidden"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10 pointer-events-none" />
        <ExperienceList
          experiences={experiences}
          onAddClick={() => setIsAddOpen(true)}
          onEditClick={(exp) => setEditingExperience(exp)}
          onDeleteClick={(exp) => setDeletingExperience(exp)}
        />
      </section>

      {/* Add Modal */}
      <AddExperienceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAddExperience}
        savingAction={savingAction}
      />

      {/* Edit Modal */}
      <EditExperienceModal
        isOpen={!!editingExperience}
        experience={editingExperience}
        onClose={() => setEditingExperience(null)}
        onSave={handleEditExperience}
        savingAction={savingAction}
      />

      {/* Delete Modal */}
      <DeleteExperienceModal
        isOpen={!!deletingExperience}
        experience={deletingExperience}
        onClose={() => setDeletingExperience(null)}
        onConfirm={handleDeleteExperience}
        savingAction={savingAction}
      />
    </>
  );
}
