'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { DetailFormData } from '@/types/admin';
import EditDetailModal from './EditDetailModal';

interface DetailAdminProps {
  isOpen: boolean;
  detailData: DetailFormData | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DetailAdmin({
  isOpen,
  detailData,
  onClose,
  onSuccess,
}: DetailAdminProps) {
  const [savingAction, setSavingAction] = useState(false);

  const handleSaveDetail = async (form: DetailFormData) => {
    if (!form.id_project) {
      toast.error('ID project tidak valid.');
      return;
    }

    setSavingAction(true);
    try {
      const payload = {
        id_project: form.id_project,
        role: form.role,
        deskripsi: form.deskripsi,
        fitur: form.fitur
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        teknologi: form.teknologi
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch('/api/admin/detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Detail project berhasil disimpan ke Supabase!');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.error || 'Gagal menyimpan detail project');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan detail project';
      toast.error(msg);
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <EditDetailModal
      isOpen={isOpen}
      initialData={detailData}
      onClose={onClose}
      onSave={handleSaveDetail}
      savingAction={savingAction}
    />
  );
}
