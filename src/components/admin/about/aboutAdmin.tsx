'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { SiteConfig } from '@/types/admin';
import AboutPreview from '@/components/admin/about/AboutPreview';
import AboutEditModal from '@/components/admin/about/AboutEditModal';

interface AboutAdminProps {
  siteConfig: SiteConfig | null;
  onRefresh: () => Promise<void>;
  onImageUpload: (file: File, onSuccess: (url: string) => void) => Promise<void>;
  uploadingImage: boolean;
}

export default function AboutAdmin({
  siteConfig,
  onRefresh,
  onImageUpload,
  uploadingImage,
}: AboutAdminProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savingAction, setSavingAction] = useState(false);

  const about = siteConfig?.about;

  const handleSaveAbout = async (updatedAbout: SiteConfig['about']) => {
    setSavingAction(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ about: updatedAbout }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('About section berhasil diperbarui!');
        setIsEditOpen(false);
        await onRefresh();
      } else {
        toast.error(data.error || 'Gagal menyimpan about');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan about';
      toast.error(msg);
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <>
      <AboutPreview about={about} onEdit={() => setIsEditOpen(true)} />

      <AboutEditModal
        isOpen={isEditOpen}
        initialData={about || null}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveAbout}
        onImageUpload={onImageUpload}
        uploadingImage={uploadingImage}
        savingAction={savingAction}
      />
    </>
  );
}