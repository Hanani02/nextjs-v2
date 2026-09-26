'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LuArrowLeft, LuLoader, LuFileText } from 'react-icons/lu';
import { toast, Toaster } from 'react-hot-toast';
import type { DetailFormData } from '@/types/admin';
import DetailAdmin from '@/components/admin/detail/detailAdmin';

interface ProjectDetailPageProps {
  detailForm?: DetailFormData;
  setDetailForm?: (form: DetailFormData) => void;
  activeModal?: string | null;
  setActiveModal?: (modal: string | null) => void;
  handleSaveDetail?: (e: React.FormEvent) => Promise<void>;
  savingAction?: boolean;
}

export default function AdminProjectDetailPage(props: ProjectDetailPageProps) {
  // If props from older interface are passed
  if (props.detailForm && props.activeModal === 'editDetail') {
    return (
      <DetailAdmin
        isOpen={true}
        detailData={props.detailForm}
        onClose={() => props.setActiveModal && props.setActiveModal(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center p-6">
      <Toaster position="top-right" />
      <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-card text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center mx-auto">
          <LuFileText className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-text">Detail Project Manajemen</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          Pengelolaan detail project dapat diakses langsung melalui tombol &ldquo;Detail&rdquo; pada masing-masing kartu project di halaman Admin Project.
        </p>
        <div className="pt-2">
          <Link
            href="/Admin#projects-admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background font-semibold text-xs hover:bg-blue-400 transition"
          >
            <LuArrowLeft className="w-4 h-4" />
            <span>Ke Halaman Kelola Project</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
