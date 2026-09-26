'use client';

import { LuTrash2, LuX, LuLoader } from 'react-icons/lu';
import type { ExperienceItem } from '@/types/admin';

interface DeleteExperienceModalProps {
  isOpen: boolean;
  experience: ExperienceItem | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  savingAction: boolean;
}

export default function DeleteExperienceModal({
  isOpen,
  experience,
  onClose,
  onConfirm,
  savingAction,
}: DeleteExperienceModalProps) {
  if (!isOpen || !experience) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl border border-red-500/30 bg-card p-6 shadow-2xl space-y-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-text p-1 rounded-lg"
        >
          <LuX className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
          <LuTrash2 className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="text-base font-bold text-text">Hapus Experience</h3>
          <p className="text-xs text-gray-400">
            Apakah Anda yakin ingin menghapus catatan pengalaman ini:
          </p>
          <p className="text-sm font-semibold text-red-400">
            &ldquo;{experience.role} ({experience.company})&rdquo;?
          </p>
          <p className="text-[11px] text-gray-500">
            Tindakan ini permanen dan akan menghapus baris terkait di tabel Supabase <code className="text-primary font-mono">experience</code>.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={savingAction}
            className="flex-1 py-2 rounded-xl border border-border bg-surface text-gray-300 font-semibold text-xs hover:bg-card transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={savingAction}
            className="flex-1 py-2 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {savingAction ? (
              <>
                <LuLoader className="w-3.5 h-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>Ya, Hapus</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
