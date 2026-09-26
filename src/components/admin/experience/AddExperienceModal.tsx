'use client';

import { useState } from 'react';
import { LuBriefcase, LuSave, LuX, LuLoader } from 'react-icons/lu';
import type { ExperienceFormData } from '@/types/admin';

interface AddExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExperienceFormData) => Promise<void>;
  savingAction: boolean;
}

export default function AddExperienceModal({
  isOpen,
  onClose,
  onSave,
  savingAction,
}: AddExperienceModalProps) {
  const [form, setForm] = useState<ExperienceFormData>({
    role: '',
    company: '',
    period: '2025 - present',
    descriptions: '',
    technologies: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="text-base font-bold text-text flex items-center gap-2">
            <LuBriefcase className="w-4 h-4 text-primary" />
            Tambah Experience Baru
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
          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Role / Posisi <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Contoh: Software Engineering Student / Frontend Developer"
              required
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Company / Institusi <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="SMKN 1 Kota Pasuruan"
                required
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-1">Periode Waktu</label>
              <input
                type="text"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                placeholder="2025 - present"
                required
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Deskripsi Pengalaman <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={form.descriptions}
              onChange={(e) => setForm({ ...form, descriptions: e.target.value })}
              placeholder="Jelaskan peran, tanggung jawab, dan capaian selama periode tersebut..."
              required
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text leading-relaxed transition"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Teknologi (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={form.technologies}
              onChange={(e) => setForm({ ...form, technologies: e.target.value })}
              placeholder="Next.js, Tailwind CSS, TypeScript, Supabase"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Disimpan ke kolom Supabase <code className="text-primary font-mono">technologies text[]</code>.
            </p>
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
              <span>{savingAction ? 'Menyimpan...' : 'Tambah Experience'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
