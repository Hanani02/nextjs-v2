'use client';

import { toast } from 'react-hot-toast';
import { LuDatabase, LuCopy, LuX } from 'react-icons/lu';

interface SqlHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA = `-- ==========================================
-- 1. TABEL HERO SECTION
-- ==========================================
CREATE TABLE IF NOT EXISTS hero (
  id bigint PRIMARY KEY DEFAULT 1,
  greeting varchar(500) NOT NULL DEFAULT '── Hello I''m M. Akbar Hanani',
  roles varchar(500) NOT NULL DEFAULT 'Fullstack Developer | Web Developer | Mobile Developer',
  headline varchar(500) NOT NULL DEFAULT 'Building modern web experience with',
  headline_highlight varchar(500) NOT NULL DEFAULT 'clean code',
  description text NOT NULL DEFAULT 'I design and build scalable fullstack applications using modern technologies like Next.js, TypeScript, and Supabase. Focused on performance, clean UI.',
  profile_image varchar(500) NOT NULL DEFAULT '/image/profil.jpeg',
  profile_image_position varchar(50) NOT NULL DEFAULT 'center',
  profile_image_scale numeric NOT NULL DEFAULT 1.0,
  profile_image_fit varchar(50) NOT NULL DEFAULT 'cover',
  cta_contact_text varchar(100) NOT NULL DEFAULT 'get in touch',
  cta_projects_text varchar(100) NOT NULL DEFAULT 'View projects',
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_hero_row CHECK (id = 1)
);

-- Data Default Hero (Insert jika belum ada)
INSERT INTO hero (id, greeting, roles, headline, headline_highlight, description, profile_image)
VALUES (
  1,
  '── Hello I''m M. Akbar Hanani',
  'Fullstack Developer | Web Developer | Mobile Developer',
  'Building modern web experience with',
  'clean code',
  'I design and build scalable fullstack applications using modern technologies like Next.js, TypeScript, and Supabase. Focused on performance, clean UI.',
  '/image/profil.jpeg'
) ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2. TABEL ABOUT ME SECTION
-- ==========================================
CREATE TABLE IF NOT EXISTS about (
  id bigint PRIMARY KEY DEFAULT 1,
  badge varchar(100) NOT NULL DEFAULT 'About Me',
  title varchar(500) NOT NULL DEFAULT 'I build scalable and user-focused web applications',
  description1 text NOT NULL,
  description2 text NOT NULL,
  about_image varchar(500) NOT NULL DEFAULT '/image/about.jpeg',
  about_image_position varchar(50) NOT NULL DEFAULT 'center',
  about_image_scale numeric NOT NULL DEFAULT 1.0,
  about_image_fit varchar(50) NOT NULL DEFAULT 'cover',
  highlights jsonb NOT NULL DEFAULT '[{"title": "Clean code", "icon": "code"}, {"title": "Fullstack Apps", "icon": "database"}, {"title": "Performance", "icon": "rocket"}]'::jsonb,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_about_row CHECK (id = 1)
);

-- Data Default About (Insert jika belum ada)
INSERT INTO about (id, badge, title, description1, description2, about_image)
VALUES (
  1,
  'About Me',
  'I build scalable and user-focused web applications',
  'I''m a Grade 11 Software Engineering (RPL) student at SMKN 1 Kota Pasuruan, passionate about building smooth, modern, and user-friendly web applications.',
  'I frequently work with HTML, CSS, JavaScript, TypeScript, React, Next.js, and Tailwind CSS, along with MySQL and basic Python.',
  '/image/about.jpeg'
) ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 3. TABEL PROJECT
-- ==========================================
CREATE TABLE IF NOT EXISTS project (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  judul_project varchar(500) NOT NULL,
  deskripsi_project text NOT NULL,
  image varchar(500) NOT NULL,
  tags text[] NOT NULL,
  kategori varchar(500) NOT NULL,
  live_url varchar(500) NOT NULL,
  github_url varchar(500) NULL,
  slug varchar(500) NOT NULL
);

-- ==========================================
-- 4. TABEL EXPERIENCE
-- ==========================================
CREATE TABLE IF NOT EXISTS experience (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role varchar(500) NOT NULL,
  company varchar(500) NOT NULL,
  period varchar(500) NOT NULL,
  descriptions text NOT NULL,
  technologies text[] NOT NULL
);

-- ==========================================
-- 5. TABEL DETAIL PROJECT
-- ==========================================
CREATE TABLE IF NOT EXISTS detail (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_project bigint NOT NULL,
  deskripsi text NOT NULL,
  role varchar(500) NOT NULL,
  fitur text[] NOT NULL,
  teknologi text[] NOT NULL,

  CONSTRAINT fk_detail_project
    FOREIGN KEY (id_project)
    REFERENCES project(id)
    ON DELETE restrict
);

-- ==========================================
-- 6. KEAMANAN RLS (Row Level Security) SUPABASE
-- ==========================================
ALTER TABLE hero DISABLE ROW LEVEL SECURITY;
ALTER TABLE about DISABLE ROW LEVEL SECURITY;
ALTER TABLE project DISABLE ROW LEVEL SECURITY;
ALTER TABLE experience DISABLE ROW LEVEL SECURITY;
ALTER TABLE detail DISABLE ROW LEVEL SECURITY;`;

export default function SqlHelperModal({ isOpen, onClose }: SqlHelperModalProps) {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    toast.success('Query SQL Supabase berhasil disalin ke clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="text-base font-bold text-text flex items-center gap-2">
            <LuDatabase className="w-4 h-4 text-primary" />
            Struktur Tabel & Schema Supabase
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-text transition p-1 rounded-lg hover:bg-surface"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-gray-300">
          <p>
            Berikut adalah skema tabel database Supabase yang digunakan oleh aplikasi ini (<code className="text-primary font-mono">project</code>, <code className="text-primary font-mono">experience</code>, dan <code className="text-primary font-mono">detail</code>). Anda dapat menyalin dan menjalankannya di <strong>Supabase Dashboard &gt; SQL Editor</strong>:
          </p>

          <div className="relative rounded-xl bg-surface border border-border p-4 font-mono text-[11px] overflow-x-auto text-primary/90">
            <pre className="whitespace-pre">{SQL_SCHEMA}</pre>
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-card border border-border text-[10px] font-semibold text-gray-300 hover:text-primary hover:border-primary/40 transition flex items-center gap-1 shadow cursor-pointer"
            >
              <LuCopy className="w-3 h-3" />
              <span>Salin SQL</span>
            </button>
          </div>

          <div className="rounded-xl border border-border bg-surface/50 p-3 space-y-1 text-[11px] text-gray-400">
            <p className="font-semibold text-text">Catatan Foreign Key Relasi:</p>
            <p>
              Tabel <code className="text-primary font-mono">detail</code> memiliki foreign key <code className="text-primary font-mono">id_project</code> yang terhubung ke <code className="text-primary font-mono">project(id)</code> dengan aturan <code className="text-primary font-mono">ON DELETE restrict</code>. Server API secara otomatis menghapus record <code className="text-primary font-mono">detail</code> terlebih dahulu sebelum menghapus data <code className="text-primary font-mono">project</code>.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary text-background font-semibold text-xs hover:bg-blue-400 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
