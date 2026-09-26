'use client';

import { LuPencil, LuMail, LuPhone, LuMapPin } from 'react-icons/lu';
import type { SiteConfig } from '@/types/admin';

interface ContactPreviewProps {
  contact: SiteConfig['contact'] | undefined;
  onEdit: () => void;
}

export default function ContactPreview({ contact, onEdit }: ContactPreviewProps) {
  return (
    <section id="contact-admin" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10 pointer-events-none" />

      <div className="w-[90%] max-w-6xl mx-auto space-y-8">
        {/* Header & Edit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-semibold text-primary w-fit">
            <LuMail className="w-3.5 h-3.5" />
            Kontak & Lokasi (Live Preview)
          </span>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-background font-semibold text-xs hover:bg-blue-400 shadow-lg shadow-primary/25 transition cursor-pointer w-fit"
          >
            <LuPencil className="w-3.5 h-3.5" />
            <span>Edit Kontak & Lokasi</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Preview Form Card */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h3 className="text-lg font-semibold text-text">
              {contact?.title || "Let's build something great"}
            </h3>
            <p className="text-xs text-gray-400">
              {contact?.description ||
                "Have a project in mind? I'd love to hear about it. Let's connect."}
            </p>
            <div className="space-y-3 opacity-70 pointer-events-none">
              <input
                disabled
                placeholder="Nama Pengirim"
                className="w-full px-4 py-2 rounded-lg bg-surface border border-border text-xs"
              />
              <input
                disabled
                placeholder="Email Pengirim"
                className="w-full px-4 py-2 rounded-lg bg-surface border border-border text-xs"
              />
              <textarea
                disabled
                rows={3}
                placeholder="Pesan..."
                className="w-full px-4 py-2 rounded-lg bg-surface border border-border text-xs"
              />
            </div>
          </div>

          {/* Right Contact Info Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Kontak & Lokasi</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <LuMail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email Utama</p>
                  <p className="text-sm font-semibold text-text">
                    {contact?.email || 'akbarhanani02@gmail.com'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <LuPhone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Nomor Telepon / WhatsApp</p>
                  <p className="text-sm font-semibold text-text">
                    {contact?.phone || '+62 817 5204 440'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <LuMapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Lokasi / Domisili</p>
                  <p className="text-sm font-semibold text-text">
                    {contact?.location || 'Pasuruan, Jawa Timur, Indonesia'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
