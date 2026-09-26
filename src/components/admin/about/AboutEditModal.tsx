'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LuPencil, LuSave, LuUpload, LuX, LuLoader } from 'react-icons/lu';
import type { SiteConfig } from '@/types/admin';

interface AboutEditModalProps {
  isOpen: boolean;
  initialData: SiteConfig['about'] | null;
  onClose: () => void;
  onSave: (data: SiteConfig['about']) => Promise<void>;
  onImageUpload: (file: File, onSuccess: (url: string) => void) => Promise<void>;
  uploadingImage: boolean;
  savingAction: boolean;
}

export default function AboutEditModal({
  isOpen,
  initialData,
  onClose,
  onSave,
  onImageUpload,
  uploadingImage,
  savingAction,
}: AboutEditModalProps) {
  const [form, setForm] = useState<SiteConfig['about']>({
    badge: 'About Me',
    title: '',
    description1: '',
    description2: '',
    aboutImage: '/image/about.jpeg',
    aboutImagePosition: 'center',
    aboutImageScale: 1,
    aboutImageFit: 'cover',
    highlights: [],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        aboutImagePosition: initialData.aboutImagePosition || 'center',
        aboutImageScale: initialData.aboutImageScale || 1,
        aboutImageFit: initialData.aboutImageFit || 'cover',
      });
    }
  }, [initialData]);

  if (!isOpen || !initialData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  const positionPresets = [
    { label: 'Atas (Wajah)', value: 'top' },
    { label: 'Tengah', value: 'center' },
    { label: 'Bawah', value: 'bottom' },
    { label: 'Kiri', value: 'left' },
    { label: 'Kanan', value: 'right' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm">
      <div className="relative my-8 w-full max-w-lg space-y-5 rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="flex items-center gap-2 text-base font-bold text-text">
            <LuPencil className="h-4 w-4 text-primary" />
            Edit About Section & Foto
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-text transition p-1 rounded-lg hover:bg-surface"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Foto About & Pengaturan Layout */}
          <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-text">Foto About Me &amp; Pengaturan Layout</label>
              <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                Live Layout Tuner
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Rounded Live Preview Matching About Section */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="relative h-24 w-24 overflow-hidden rounded-xl border-2 border-primary/50 bg-background shadow-lg shadow-primary/10">
                  <Image
                    fill
                    src={form.aboutImage || '/image/about.jpeg'}
                    alt="Preview"
                    className="rounded-xl transition-transform duration-200"
                    style={{
                      objectFit: form.aboutImageFit || 'cover',
                      objectPosition: form.aboutImagePosition || 'center',
                      transform: `scale(${form.aboutImageScale || 1})`,
                    }}
                    unoptimized
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-mono">Preview Box</span>
              </div>

              <div className="flex-1 w-full space-y-2">
                <label className="flex items-center gap-2 cursor-pointer w-fit px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition text-[11px] font-medium">
                  {uploadingImage ? (
                    <LuLoader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LuUpload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingImage ? 'Mengunggah...' : 'Pilih File Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      onImageUpload(file, (url) => {
                        setForm((prev) => ({ ...prev, aboutImage: url }));
                      });
                    }}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={form.aboutImage}
                  onChange={(e) => setForm({ ...form, aboutImage: e.target.value })}
                  placeholder="URL gambar (/image/about.jpeg atau https://...)"
                  className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] outline-none focus:border-primary text-text transition"
                />
              </div>
            </div>

            {/* Layout Controls: Position, Zoom, and Fit */}
            <div className="pt-3 border-t border-border/60 space-y-3">
              {/* 1. Posisi Fokus (Object Position) */}
              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1.5">
                  Posisi Fokus Foto (Biar pas &amp; tidak kepotong)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {positionPresets.map((preset) => {
                    const active = (form.aboutImagePosition || 'center') === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, aboutImagePosition: preset.value }))}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                          active
                            ? 'bg-primary text-background border-primary shadow-sm'
                            : 'bg-card text-gray-300 border-border hover:border-primary/50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Zoom / Skala Foto */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-gray-300">Zoom / Skala Foto</span>
                  <span className="font-mono text-primary font-semibold">
                    {Math.round((form.aboutImageScale || 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.6"
                  step="0.05"
                  value={form.aboutImageScale || 1}
                  onChange={(e) => setForm((prev) => ({ ...prev, aboutImageScale: parseFloat(e.target.value) }))}
                  className="w-full h-1.5 bg-card rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                  <span>80% (Kecil)</span>
                  <span>100% (Normal)</span>
                  <span>160% (Zoom Dekat)</span>
                </div>
              </div>

              {/* 3. Mode Tampilan (Fit) */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-medium text-gray-300">Mode Tampilan Gambar</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, aboutImageFit: 'cover' }))}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-medium transition cursor-pointer ${
                      (form.aboutImageFit || 'cover') === 'cover'
                        ? 'bg-primary text-background border-primary'
                        : 'bg-card text-gray-400 border-border hover:border-primary/40'
                    }`}
                  >
                    Cover (Penuh)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, aboutImageFit: 'contain' }))}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-medium transition cursor-pointer ${
                      form.aboutImageFit === 'contain'
                        ? 'bg-primary text-background border-primary'
                        : 'bg-card text-gray-400 border-border hover:border-primary/40'
                    }`}
                  >
                    Contain (Utuh)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-medium text-gray-300">Badge Section</label>
            <input
              type="text"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              placeholder="About Me"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-primary text-text transition"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-gray-300">Judul Utama About</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="I build scalable and user-focused web applications"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-primary text-text transition"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-gray-300">Deskripsi Paragraf 1</label>
            <textarea
              rows={3}
              value={form.description1}
              onChange={(e) => setForm({ ...form, description1: e.target.value })}
              placeholder="Paragraf pertama..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 leading-relaxed outline-none focus:border-primary text-text transition"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-gray-300">Deskripsi Paragraf 2</label>
            <textarea
              rows={3}
              value={form.description2}
              onChange={(e) => setForm({ ...form, description2: e.target.value })}
              placeholder="Paragraf kedua..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 leading-relaxed outline-none focus:border-primary text-text transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-surface px-4 py-2 font-semibold text-gray-300 hover:bg-card transition"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={savingAction || uploadingImage}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 font-semibold text-background shadow-lg transition hover:bg-blue-400 cursor-pointer disabled:opacity-50"
            >
              {savingAction ? (
                <LuLoader className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LuSave className="h-3.5 w-3.5" />
              )}
              <span>{savingAction ? 'Menyimpan...' : 'Simpan About'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}