'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { LuLoader } from 'react-icons/lu';

// Types
import type {
  ProjectItem,
  ExperienceItem,
  SiteConfig,
  DetailFormData,
} from '@/types/admin';
export type {
  ProjectItem,
  ExperienceItem,
  SiteConfig,
  DetailItem,
  DetailFormData,
  ProjectFormData,
  ExperienceFormData,
} from '@/types/admin';

// Modular Components
import AdminHeader from '@/components/admin/shared/AdminHeader';
import SqlHelperModal from '@/components/admin/shared/SqlHelperModal';
import HeroAdmin from '@/components/admin/hero/heroAdmin';
import AboutAdmin from '@/components/admin/about/aboutAdmin';
import ProjectAdmin from '@/components/admin/project/projectAdmin';
import DetailAdmin from '@/components/admin/detail/detailAdmin';
import ExperienceAdmin from '@/components/admin/experience/experienceAdmin';
import ContactAdmin from '@/components/admin/contact/contactAdmin';

export default function AdminPage() {
  const router = useRouter();

  // Auth & Session
  const [isAdminAuth, setIsAdminAuth] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>('Admin');

  // Supabase & Config Data
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Detail Modal state (for project relation)
  const [activeDetailProject, setActiveDetailProject] = useState<DetailFormData | null>(null);

  // SQL Helper Modal state
  const [isSqlHelperOpen, setIsSqlHelperOpen] = useState<boolean>(false);

  // Image Upload state
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // 1. Verify Admin Session on mount
  useEffect(() => {
    fetch('/api/admin/auth')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          const localUser = localStorage.getItem('user');
          if (!localUser) {
            router.push('/Login');
            return;
          }
          try {
            const parsed = JSON.parse(localUser);
            if (parsed.role !== 'admin') {
              router.push('/Login');
              return;
            }
            setAdminEmail(parsed.email || 'Admin');
          } catch {
            router.push('/Login');
            return;
          }
        } else {
          setAdminEmail(data.user?.email || 'Admin');
        }
        setIsAdminAuth(true);
      })
      .catch(() => {
        setIsAdminAuth(true);
      });
  }, [router]);

  // 2. Fetch all data from Supabase & config APIs
  const loadAllData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [configRes, projectsRes, expRes] = await Promise.all([
        fetch('/api/admin/config'),
        fetch('/api/admin/projects'),
        fetch('/api/admin/experience'),
      ]);

      const configData = await configRes.json();
      const projectsData = await projectsRes.json();
      const expData = await expRes.json();

      if (configData) {
        setSiteConfig(configData);
      }

      if (projectsData.success && projectsData.data) {
        setProjects(projectsData.data);
      }

      if (expData.success && expData.data) {
        setExperiences(expData.data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      toast.error('Gagal memuat data dari server Supabase.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAdminAuth) {
      loadAllData();
    }
  }, [isAdminAuth, loadAllData]);

  // 3. Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {}
    localStorage.removeItem('user');
    document.cookie = 'admin_session=; path=/; max-age=0; SameSite=Lax';
    toast.success('Berhasil logout.');
    router.push('/Login?door=kanagara-admin');
  };

  // 4. Image Upload helper
  const handleImageUpload = async (
    file: File,
    onSuccess: (url: string) => void
  ) => {
    setUploadingImage(true);
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
        toast.success('Foto berhasil diunggah!');
      } else {
        toast.error(data.error || 'Gagal mengunggah foto.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload gagal';
      toast.error(message);
    } finally {
      setUploadingImage(false);
    }
  };

  // 5. Open Project Detail Modal
  const handleOpenDetailModal = async (project: ProjectItem) => {
    setActiveDetailProject({
      id_project: project.id,
      projectTitle: project.judul_project,
      role: project.kategori.toLowerCase() === 'ui/ux' ? 'UI/UX Designer' : 'Fullstack Developer',
      deskripsi: project.deskripsi_project,
      fitur: '',
      teknologi: Array.isArray(project.tags) ? project.tags.join(', ') : '',
    });

    try {
      const res = await fetch(`/api/admin/detail?id_project=${project.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        setActiveDetailProject({
          id_project: project.id,
          projectTitle: project.judul_project,
          role: d.role || '',
          deskripsi: d.deskripsi || '',
          fitur: Array.isArray(d.fitur) ? d.fitur.join('\n') : '',
          teknologi: Array.isArray(d.teknologi) ? d.teknologi.join(', ') : '',
        });
      }
    } catch (err) {
      console.warn('Could not load project detail:', err);
    }
  };

  // Authentication Loading Screen
  if (isAdminAuth === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-text">
        <div className="flex items-center gap-3">
          <LuLoader className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm font-medium">Memverifikasi otentikasi admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text relative selection:bg-primary/20 selection:text-primary">
      <Toaster position="top-right" />

      {/* ===================== 1. TOP STICKY ADMIN TOOLBAR ===================== */}
      <AdminHeader
        adminEmail={adminEmail}
        projectCount={projects.length}
        experienceCount={experiences.length}
        loadingData={loadingData}
        onRefresh={loadAllData}
        onOpenSqlHelper={() => setIsSqlHelperOpen(true)}
        onLogout={handleLogout}
      />

      {/* ===================== 2. MAIN UNIFIED SECTIONS ===================== */}
      <main className="divide-y divide-border/30">
        {/* Section: Hero */}
        <HeroAdmin
          siteConfig={siteConfig}
          onRefresh={loadAllData}
          onImageUpload={handleImageUpload}
          uploadingImage={uploadingImage}
        />

        {/* Section: About */}
        <AboutAdmin
          siteConfig={siteConfig}
          onRefresh={loadAllData}
          onImageUpload={handleImageUpload}
          uploadingImage={uploadingImage}
        />

        {/* Section: Project (Supabase table: project) */}
        <ProjectAdmin
          projects={projects}
          onRefresh={loadAllData}
          onOpenDetailModal={handleOpenDetailModal}
          onImageUpload={handleImageUpload}
          uploadingImage={uploadingImage}
        />

        {/* Section: Experience (Supabase table: experience) */}
        <ExperienceAdmin
          experiences={experiences}
          onRefresh={loadAllData}
        />

        {/* Section: Contact */}
        <ContactAdmin
          siteConfig={siteConfig}
          onRefresh={loadAllData}
        />
      </main>

      {/* ===================== 3. PROJECT DETAIL MODAL (Supabase table: detail) ===================== */}
      <DetailAdmin
        isOpen={!!activeDetailProject}
        detailData={activeDetailProject}
        onClose={() => setActiveDetailProject(null)}
        onSuccess={loadAllData}
      />

      {/* ===================== 4. SQL & RLS HELPER MODAL ===================== */}
      <SqlHelperModal
        isOpen={isSqlHelperOpen}
        onClose={() => setIsSqlHelperOpen(false)}
      />
    </div>
  );
}
