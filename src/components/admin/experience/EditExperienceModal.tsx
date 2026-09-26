'use client';

import { useState, useEffect } from 'react';
import { LuBriefcase, LuSave, LuX, LuLoader } from 'react-icons/lu';
import type { ExperienceItem, ExperienceFormData } from '@/types/admin';

interface EditExperienceModalProps {
  isOpen: boolean;
  experience: ExperienceItem | null;
  onClose: () => void;
  onSave: (data: ExperienceFormData) => Promise<void>;
  savingAction: boolean;
}

export default function EditExperienceModal({
  isOpen,
  experience,
  onClose,
  onSave,
  savingAction,
}: EditExperienceModalProps) {
  const [form, setForm] = useState<ExperienceFormData>({
    id: 0,
    role: '',
    company: '',
    period: '',
    descriptions: '',
    technologies: '',
  });

  useEffect(() => {
    if (experience) {
      setForm({
        id: experience.id,
        role: experience.role,
        company: experience.company,
        period: experience.period,
        descriptions: experience.descriptions,
        technologies: Array.isArray(experience.technologies)
          ? experience.technologies.join(', ')
          : typeof experience.technologies === 'string'
          ? experience.technologies
          : '',
      });
    }
  }, [experience]);

  if (!isOpen || !experience) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-text flex items-center gap-2">
              <LuBriefcase className="w-4 h-4 text-primary" />
              Edit Experience (ID: {experience.id})
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Memperbarui data di tabel Supabase <code className="text-primary font-mono">experience</code>
            </p>
          </div>
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
              placeholder="Role"
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
                placeholder="Company"
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
              placeholder="Deskripsi pengalaman..."
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
              <span>{savingAction ? 'Menyimpan...' : 'Perbarui Experience'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
