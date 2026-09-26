'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LuArrowLeft, LuLoader } from 'react-icons/lu';
import { toast, Toaster } from 'react-hot-toast';
import type { SiteConfig } from '@/types/admin';
import AboutAdmin from '@/components/admin/about/aboutAdmin';

interface AboutPageProps {
  siteConfig?: SiteConfig | null;
  onRefresh?: () => Promise<void>;
  onImageUpload?: (file: File, onSuccess: (url: string) => void) => Promise<void>;
  uploadingImage?: boolean;
}

export default function AdminAboutPage(props: AboutPageProps) {
  const isEmbedded = props.siteConfig !== undefined;

  const [localConfig, setLocalConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(!isEmbedded);
  const [localUploading, setLocalUploading] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data) {
        setLocalConfig(data);
      }
    } catch {
      toast.error('Gagal memuat konfigurasi about.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isEmbedded) {
      fetchConfig();
    }
  }, [isEmbedded]);

  const handleLocalImageUpload = async (file: File, onSuccess: (url: string) => void) => {
    setLocalUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        onSuccess(data.url);
        toast.success('Foto about berhasil diunggah!');
      } else {
        toast.error(data.error || 'Gagal mengunggah foto.');
      }
    } catch {
      toast.error('Gagal mengunggah foto.');
    } finally {
      setLocalUploading(false);
    }
  };

  const currentConfig = isEmbedded ? props.siteConfig : localConfig;
  const refreshHandler = props.onRefresh ?? fetchConfig;
  const uploadHandler = props.onImageUpload ?? handleLocalImageUpload;
  const isUploading = props.uploadingImage ?? localUploading;

  if (isEmbedded) {
    return (
      <AboutAdmin
        siteConfig={currentConfig ?? null}
        onRefresh={refreshHandler}
        onImageUpload={uploadHandler}
        uploadingImage={isUploading}
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
          <span className="text-xs font-mono text-gray-400">Section: About</span>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-sm text-gray-400">
            <LuLoader className="w-5 h-5 animate-spin text-primary" />
            <span>Memuat data about...</span>
          </div>
        ) : (
          <AboutAdmin
            siteConfig={currentConfig ?? null}
            onRefresh={refreshHandler}
            onImageUpload={uploadHandler}
            uploadingImage={isUploading}
          />
        )}
      </main>
    </div>
  );
}
