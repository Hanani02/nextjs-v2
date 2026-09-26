'use client';

import { useState, useEffect } from 'react';
import { LuFileText, LuSave, LuX, LuLoader, LuLayers } from 'react-icons/lu';
import type { DetailFormData } from '@/types/admin';

interface EditDetailModalProps {
  isOpen: boolean;
  initialData: DetailFormData | null;
  onClose: () => void;
  onSave: (data: DetailFormData) => Promise<void>;
  savingAction: boolean;
}

export default function EditDetailModal({
  isOpen,
  initialData,
  onClose,
  onSave,
  savingAction,
}: EditDetailModalProps) {
  const [form, setForm] = useState<DetailFormData>({
    id_project: 0,
    projectTitle: '',
    role: '',
    deskripsi: '',
    fitur: '',
    teknologi: '',
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
          <div>
            <h3 className="text-base font-bold text-text flex items-center gap-2">
              <LuFileText className="w-4 h-4 text-primary" />
              Edit Detail Project (Tabel <code className="text-primary font-mono">detail</code>)
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Project: <strong className="text-primary">{form.projectTitle}</strong> (ID: {form.id_project})
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
              Role Anda Dalam Project Ini
            </label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Contoh: Fullstack Developer / UI/UX Designer"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Deskripsi Lengkap Detail
            </label>
            <textarea
              rows={4}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              placeholder="Penjelasan detail implementasi, arsitektur, atau tujuan project..."
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text leading-relaxed transition"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Fitur-Fitur Utama (Satu fitur per baris)
            </label>
            <textarea
              rows={4}
              value={form.fitur}
              onChange={(e) => setForm({ ...form, fitur: e.target.value })}
              placeholder={'Authentication\nDashboard Admin\nManajemen Siswa\nLogbook Kegiatan'}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text font-mono text-[11px] leading-relaxed transition"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Setiap baris baru akan dikonversi menjadi elemen array text di tabel Supabase <code className="text-primary font-mono">fitur text[]</code>.
            </p>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Teknologi Yang Digunakan (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={form.teknologi}
              onChange={(e) => setForm({ ...form, teknologi: e.target.value })}
              placeholder="Next.js, TypeScript, Supabase, Prisma, Tailwind CSS"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border outline-none focus:border-primary text-text transition"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Dikonversi menjadi array <code className="text-primary font-mono">teknologi text[]</code>.
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
              <span>{savingAction ? 'Menyimpan...' : 'Simpan Detail'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
