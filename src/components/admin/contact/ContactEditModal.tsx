'use client';

import { useState, useEffect } from 'react';
import { LuPencil, LuSave, LuX, LuLoader } from 'react-icons/lu';
import type { SiteConfig } from '@/types/admin';

interface ContactEditModalProps {
  isOpen: boolean;
  initialData: SiteConfig['contact'] | null;
  onClose: () => void;
  onSave: (data: SiteConfig['contact']) => Promise<void>;
  savingAction: boolean;
}

export default function ContactEditModal({
  isOpen,
  initialData,
  onClose,
  onSave,
  savingAction,
}: ContactEditModalProps) {
  const [form, setForm] = useState<SiteConfig['contact']>({
    badge: 'Contact',
    title: '',
    highlight: '',
    description: '',
    email: '',
    phone: '',
    location: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  if (!isOpen || !initialData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="text-base font-bold text-text flex items-center gap-2">
            <LuPencil className="w-4 h-4 text-primary" />
            Edit Kontak & Lokasi
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-text transition p-1 rounded-lg hover:bg-surface"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Badge Section</label>
              <input
                type="text"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="Contact"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-1">Highlight Teks</label>
              <input
                type="text"
                value={form.highlight}
                onChange={(e) => setForm({ ...form, highlight: e.target.value })}
                placeholder="something great"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Judul Utama</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Let's build something great"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Deskripsi Kontak</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Have a project in mind?..."
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text leading-relaxed transition"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Alamat Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="akbarhanani02@gmail.com"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Nomor Telepon / WhatsApp</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+62 817 5204 440"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Lokasi Domisili</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Pasuruan, Jawa Timur, Indonesia"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-surface text-gray-300 font-semibold hover:bg-card transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingAction}
              className="px-5 py-2 rounded-xl bg-primary text-background font-semibold hover:bg-blue-400 transition flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {savingAction ? (
                <LuLoader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LuSave className="w-3.5 h-3.5" />
              )}
              <span>{savingAction ? 'Menyimpan...' : 'Simpan Kontak'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
