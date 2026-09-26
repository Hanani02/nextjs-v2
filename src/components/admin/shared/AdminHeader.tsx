'use client';

import Link from 'next/link';
import {
  LuShieldCheck,
  LuDatabase,
  LuRefreshCw,
  LuEye,
  LuLogOut,
} from 'react-icons/lu';

interface AdminHeaderProps {
  adminEmail: string;
  projectCount: number;
  experienceCount: number;
  loadingData: boolean;
  onRefresh: () => void;
  onOpenSqlHelper: () => void;
  onLogout: () => void;
}

export default function AdminHeader({
  adminEmail,
  projectCount,
  experienceCount,
  loadingData,
  onRefresh,
  onOpenSqlHelper,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border shadow-lg">
      <div className="w-[92%] max-w-7xl mx-auto py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <LuShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-text">Kanagara Studio</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold border border-primary/30">
                ADMIN MODE
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Masuk sebagai: {adminEmail}</p>
          </div>
        </div>

        {/* Quick Jump Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-surface/80 p-1 rounded-xl border border-border text-xs">
          <a
            href="#hero-admin"
            className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-text hover:bg-card transition"
          >
            Hero
          </a>
          <a
            href="#about-admin"
            className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-text hover:bg-card transition"
          >
            About
          </a>
          <a
            href="#projects-admin"
            className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-text hover:bg-card transition"
          >
            Projects ({projectCount})
          </a>
          <a
            href="#experience-admin"
            className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-text hover:bg-card transition"
          >
            Experience ({experienceCount})
          </a>
          <a
            href="#contact-admin"
            className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-text hover:bg-card transition"
          >
            Contact
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* SQL Helper Button */}
          <button
            type="button"
            onClick={onOpenSqlHelper}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-medium text-gray-300 hover:border-primary/50 hover:text-primary transition cursor-pointer"
            title="Lihat query SQL Supabase"
          >
            <LuDatabase className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">SQL Supabase</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loadingData}
            className="p-2 rounded-xl border border-border bg-surface text-gray-300 hover:text-primary hover:border-primary/50 transition cursor-pointer disabled:opacity-50"
            title="Segarkan Data dari Supabase"
          >
            <LuRefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin text-primary' : ''}`} />
          </button>

          {/* Live Preview Button */}
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-medium text-gray-300 hover:border-primary/50 hover:text-primary transition"
          >
            <LuEye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lihat Web Publik</span>
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition cursor-pointer"
            title="Logout dari Dashboard Admin"
          >
            <LuLogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
