'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { SiteConfig } from '@/types/admin';
import ContactPreview from './ContactPreview';
import ContactEditModal from './ContactEditModal';

interface ContactAdminProps {
  siteConfig: SiteConfig | null;
  onRefresh: () => Promise<void>;
}

export default function ContactAdmin({
  siteConfig,
  onRefresh,
}: ContactAdminProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savingAction, setSavingAction] = useState(false);

  const contact = siteConfig?.contact;

  const handleSaveContact = async (updatedContact: SiteConfig['contact']) => {
    setSavingAction(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: updatedContact }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Kontak & lokasi berhasil diperbarui!');
        setIsEditOpen(false);
        await onRefresh();
      } else {
        toast.error(data.error || 'Gagal menyimpan kontak');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan kontak';
      toast.error(msg);
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <>
      <ContactPreview contact={contact} onEdit={() => setIsEditOpen(true)} />

      <ContactEditModal
        isOpen={isEditOpen}
        initialData={contact || null}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveContact}
        savingAction={savingAction}
      />
    </>
  );
}
