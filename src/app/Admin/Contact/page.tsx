'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LuArrowLeft, LuLoader } from 'react-icons/lu';
import { toast, Toaster } from 'react-hot-toast';
import type { SiteConfig } from '@/types/admin';
import ContactAdmin from '@/components/admin/contact/contactAdmin';

interface ContactPageProps {
  siteConfig?: SiteConfig | null;
  onRefresh?: () => Promise<void>;
}

export default function AdminContactPage(props: ContactPageProps) {
  const isEmbedded = props.siteConfig !== undefined;

  const [localConfig, setLocalConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(!isEmbedded);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data) {
        setLocalConfig(data);
      }
    } catch {
      toast.error('Gagal memuat konfigurasi kontak.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isEmbedded) {
      fetchConfig();
    }
  }, [isEmbedded]);

  const currentConfig = isEmbedded ? props.siteConfig : localConfig;
  const refreshHandler = props.onRefresh ?? fetchConfig;

  if (isEmbedded) {
    return (
      <ContactAdmin
        siteConfig={currentConfig ?? null}
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
          <span className="text-xs font-mono text-gray-400">Section: Contact</span>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-sm text-gray-400">
            <LuLoader className="w-5 h-5 animate-spin text-primary" />
            <span>Memuat data kontak...</span>
          </div>
        ) : (
          <ContactAdmin
            siteConfig={currentConfig ?? null}
            onRefresh={refreshHandler}
          />
        )}
      </main>
    </div>
  );
}
