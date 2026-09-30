'use client';

import { useState } from 'react';
import Image from 'next/image';
import { LuLayers, LuSave, LuX, LuUpload, LuLoader } from 'react-icons/lu';
import type { ProjectFormData } from '@/types/admin';
import { resolveImageUrl } from '@/lib/utils';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormData) => Promise<void>;
  onImageUpload: (file: File, onSuccess: (url: string) => void) => Promise<void>;
  uploadingImage: boolean;
  savingAction: boolean;
}

export default function AddProjectModal({
  isOpen,
  onClose,
  onSave,
  onImageUpload,
  uploadingImage,
  savingAction,
}: AddProjectModalProps) {
  const [form, setForm] = useState<ProjectFormData>({
    judul_project: '',
    deskripsi_project: '',
    image: '/image/auroraweb.png',
    tags: '',
    kategori: 'web',
    live_url: '',
    github_url: '',
    slug: '',
  });

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setForm((prev) => ({
      ...prev,
      judul_project: val,
      slug: prev.slug === '' || prev.slug === prev.judul_project.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        ? generatedSlug
        : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="text-base font-bold text-text flex items-center gap-2">
            <LuLayers className="w-4 h-4 text-primary" />
            Tambah Project Baru ke Supabase
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
            <div className="sm:col-span-2">
              <label className="block text-gray-300 font-medium mb-1">
                Judul Project <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.judul_project}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Contoh: Platform E-Commerce Modern"
                required
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Slug URL <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="slug-project"
                required
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text font-mono transition"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">Kategori</label>
              <select
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
              >
                <option value="web">Web Development</option>
                <option value="UI/UX">UI/UX Design</option>
                <option value="mobile">Mobile App</option>
                <option value="IoT">IoT / Hardware</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Project Image */}
          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-3">
            <label className="block font-semibold text-text">Foto / Thumbnail Project</label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-16 rounded-lg border border-primary/40 overflow-hidden shrink-0 bg-background">
                <Image
                  fill
                  src={resolveImageUrl(form.image, '/image/auroraweb.png')}
                  alt="Thumbnail Preview"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="flex items-center gap-2 cursor-pointer w-fit px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition text-[11px] font-medium">
                  {uploadingImage ? (
                    <LuLoader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LuUpload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingImage ? 'Mengunggah...' : 'Pilih File Gambar'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onImageUpload(file, (url) => {
                          setForm((prev) => ({ ...prev, image: url }));
                        });
                      }
                    }}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="Atau URL gambar (/image/auroraweb.png atau https://...)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-card border border-border text-[11px] outline-none focus:border-primary text-text transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Tags / Teknologi (pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Contoh: Next.js, TypeScript, Tailwind, Supabase"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Live URL (Demo)</label>
              <input
                type="url"
                value={form.live_url}
                onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-1">GitHub URL (Opsional)</label>
              <input
                type="url"
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Deskripsi Singkat Project <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              value={form.deskripsi_project}
              onChange={(e) => setForm({ ...form, deskripsi_project: e.target.value })}
              required
              placeholder="Ceritakan tentang project ini..."
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text leading-relaxed transition"
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
              disabled={savingAction || uploadingImage}
              className="px-5 py-2 rounded-xl bg-primary text-background font-semibold hover:bg-blue-400 transition flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {savingAction ? (
                <LuLoader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LuSave className="w-3.5 h-3.5" />
              )}
              <span>{savingAction ? 'Menyimpan...' : 'Tambah Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
