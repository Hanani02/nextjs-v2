'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LuArrowLeft, LuLoader } from 'react-icons/lu';
import { toast, Toaster } from 'react-hot-toast';
import type { ExperienceItem } from '@/types/admin';
import ExperienceAdmin from '@/components/admin/experience/experienceAdmin';

interface ExperiencePageProps {
  experiences?: ExperienceItem[];
  onRefresh?: () => Promise<void>;
}

export default function AdminExperiencePage(props: ExperiencePageProps) {
  const isEmbedded = !!props.experiences;

  const [localExperiences, setLocalExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(!isEmbedded);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/experience');
      const data = await res.json();
      if (data.success && data.data) {
        setLocalExperiences(data.data);
      }
    } catch {
      toast.error('Gagal memuat data experience.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isEmbedded) {
      fetchExperiences();
    }
  }, [isEmbedded]);

  const experienceList = props.experiences ?? localExperiences;
  const refreshHandler = props.onRefresh ?? fetchExperiences;

  if (isEmbedded) {
    return (
      <ExperienceAdmin
        experiences={experienceList}
        onRefresh={refreshHandler}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <Toaster position="top-right" />
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border shadow-lg py-3 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/Admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-primary transition"
          >
            <LuArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-gray-400">Tabel: experience</span>
          </div>
        </div>
      </header>

      <main className="py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-sm text-gray-400">
            <LuLoader className="w-5 h-5 animate-spin text-primary" />
            <span>Memuat data experience dari Supabase...</span>
          </div>
        ) : (
          <ExperienceAdmin
            experiences={experienceList}
            onRefresh={refreshHandler}
          />
        )}
      </main>
    </div>
  );
}
