'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { SiteConfig } from '@/types/admin';
import HeroPreview from './HeroPreview';
import HeroEditModal from './HeroEditModal';

interface HeroAdminProps {
  siteConfig: SiteConfig | null;
  onRefresh: () => Promise<void>;
  onImageUpload: (file: File, onSuccess: (url: string) => void) => Promise<void>;
  uploadingImage: boolean;
}

export default function HeroAdmin({
  siteConfig,
  onRefresh,
  onImageUpload,
  uploadingImage,
}: HeroAdminProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savingAction, setSavingAction] = useState(false);

  const hero = siteConfig?.hero;

  const handleSaveHero = async (updatedHero: SiteConfig['hero']) => {
    setSavingAction(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero: updatedHero }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Hero section berhasil diperbarui!');
        setIsEditOpen(false);
        await onRefresh();
      } else {
        toast.error(data.error || 'Gagal menyimpan hero');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan hero';
      toast.error(msg);
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <>
      <HeroPreview hero={hero} onEdit={() => setIsEditOpen(true)} />

      <HeroEditModal
        isOpen={isEditOpen}
        initialData={hero || null}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveHero}
        onImageUpload={onImageUpload}
        uploadingImage={uploadingImage}
        savingAction={savingAction}
      />
    </>
  );
}
