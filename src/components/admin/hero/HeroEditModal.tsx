'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LuPencil, LuSave, LuX, LuUpload, LuLoader } from 'react-icons/lu';
import type { SiteConfig } from '@/types/admin';

interface HeroEditModalProps {
  isOpen: boolean;
  initialData: SiteConfig['hero'] | null;
  onClose: () => void;
  onSave: (data: SiteConfig['hero']) => Promise<void>;
  onImageUpload: (file: File, onSuccess: (url: string) => void) => Promise<void>;
  uploadingImage: boolean;
  savingAction: boolean;
}

export default function HeroEditModal({
  isOpen,
  initialData,
  onClose,
  onSave,
  onImageUpload,
  uploadingImage,
  savingAction,
}: HeroEditModalProps) {
  const [form, setForm] = useState<SiteConfig['hero']>({
    greeting: '',
    roles: '',
    headline: '',
    headlineHighlight: '',
    description: '',
    profileImage: '/image/profil.jpeg',
    profileImagePosition: 'center',
    profileImageScale: 1,
    profileImageFit: 'cover',
    ctaContactText: 'get in touch',
    ctaProjectsText: 'View projects',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        profileImagePosition: initialData.profileImagePosition || 'center',
        profileImageScale: initialData.profileImageScale || 1,
        profileImageFit: initialData.profileImageFit || 'cover',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="text-base font-bold text-text flex items-center gap-2">
            <LuPencil className="w-4 h-4 text-primary" />
            Edit Hero Section & Foto Profil
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
          {/* Profile Image & Layout Adjustments */}
          <div className="p-4 rounded-xl bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-text">Foto Profil Hero &amp; Pengaturan Layout</label>
              <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                Live Layout Tuner
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Circular Live Preview Matching Homepage */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="relative w-24 h-24 rounded-full border-2 border-primary/50 overflow-hidden bg-background shadow-lg shadow-primary/10">
                  <Image
                    fill
                    src={form.profileImage || '/image/profil.jpeg'}
                    alt="Preview"
                    className="rounded-full transition-transform duration-200"
                    style={{
                      objectFit: form.profileImageFit || 'cover',
                      objectPosition: form.profileImagePosition || 'center',
                      transform: `scale(${form.profileImageScale || 1})`,
                    }}
                    unoptimized
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-mono">Preview Lingkaran</span>
              </div>

              <div className="space-y-2 flex-1 w-full">
                <label className="flex items-center gap-2 cursor-pointer w-fit px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition text-[11px] font-medium">
                  {uploadingImage ? (
                    <LuLoader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LuUpload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingImage ? 'Mengunggah...' : 'Pilih File Foto Profil'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onImageUpload(file, (url) => {
                          setForm((prev) => ({ ...prev, profileImage: url }));
                        });
                      }
                    }}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={form.profileImage}
                  onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                  placeholder="URL Foto Profil (/image/profil.jpeg atau https://...)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-card border border-border text-[11px] outline-none focus:border-primary text-text transition"
                />
              </div>
            </div>

            {/* Layout Controls: Position, Zoom, and Fit */}
            <div className="pt-3 border-t border-border/60 space-y-3">
              {/* 1. Posisi Fokus (Object Position) */}
              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1.5">
                  Posisi Fokus Foto (Biar pas &amp; wajah tidak kepotong)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {positionPresets.map((preset) => {
                    const active = (form.profileImagePosition || 'center') === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, profileImagePosition: preset.value }))}
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
                    {Math.round((form.profileImageScale || 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.6"
                  step="0.05"
                  value={form.profileImageScale || 1}
                  onChange={(e) => setForm((prev) => ({ ...prev, profileImageScale: parseFloat(e.target.value) }))}
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
                    onClick={() => setForm((prev) => ({ ...prev, profileImageFit: 'cover' }))}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-medium transition cursor-pointer ${
                      (form.profileImageFit || 'cover') === 'cover'
                        ? 'bg-primary text-background border-primary'
                        : 'bg-card text-gray-400 border-border hover:border-primary/40'
                    }`}
                  >
                    Cover (Penuh)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, profileImageFit: 'contain' }))}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-medium transition cursor-pointer ${
                      form.profileImageFit === 'contain'
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Teks Greeting</label>
              <input
                type="text"
                value={form.greeting}
                onChange={(e) => setForm({ ...form, greeting: e.target.value })}
                placeholder="── Hello I'm..."
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-1">Badge Roles</label>
              <input
                type="text"
                value={form.roles}
                onChange={(e) => setForm({ ...form, roles: e.target.value })}
                placeholder="Fullstack Developer | Web Developer"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Headline Utama</label>
              <input
                type="text"
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                placeholder="Building modern web experience with"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-1">Headline Highlight (Warna Biru)</label>
              <input
                type="text"
                value={form.headlineHighlight}
                onChange={(e) => setForm({ ...form, headlineHighlight: e.target.value })}
                placeholder="clean code"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Deskripsi Hero</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Deskripsi singkat..."
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text leading-relaxed transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Teks Tombol CTA Kontak</label>
              <input
                type="text"
                value={form.ctaContactText}
                onChange={(e) => setForm({ ...form, ctaContactText: e.target.value })}
                placeholder="get in touch"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-1">Teks Tombol CTA Projects</label>
              <input
                type="text"
                value={form.ctaProjectsText}
                onChange={(e) => setForm({ ...form, ctaProjectsText: e.target.value })}
                placeholder="View projects"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
              />
            </div>
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
              <span>{savingAction ? 'Menyimpan...' : 'Simpan Hero'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
