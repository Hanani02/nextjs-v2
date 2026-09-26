export interface ProjectItem {
  id: number;
  judul_project: string;
  deskripsi_project: string;
  image: string;
  tags: string[];
  kategori: string;
  live_url: string;
  github_url: string | null;
  slug: string;
}

export interface ExperienceItem {
  id: number;
  role: string;
  company: string;
  period: string;
  descriptions: string;
  technologies: string[];
}

export interface DetailItem {
  id?: number;
  id_project: number;
  deskripsi: string;
  role: string;
  fitur: string[];
  teknologi: string[];
}

export interface SiteConfig {
  hero: {
    greeting: string;
    roles: string;
    headline: string;
    headlineHighlight: string;
    description: string;
    profileImage: string;
    profileImagePosition?: string;
    profileImageScale?: number;
    profileImageFit?: 'cover' | 'contain';
    ctaContactText: string;
    ctaProjectsText: string;
  };
  about: {
    badge: string;
    title: string;
    description1: string;
    description2: string;
    aboutImage: string;
    aboutImagePosition?: string;
    aboutImageScale?: number;
    aboutImageFit?: 'cover' | 'contain';
    highlights: Array<{ title: string; icon: string }>;
  };
  contact: {
    badge: string;
    title: string;
    highlight: string;
    description: string;
    email: string;
    phone: string;
    location: string;
  };
}

export interface ProjectFormData {
  id?: number;
  judul_project: string;
  deskripsi_project: string;
  image: string;
  tags: string;
  kategori: string;
  live_url: string;
  github_url: string;
  slug: string;
}

export interface DetailFormData {
  id_project: number;
  projectTitle: string;
  role: string;
  deskripsi: string;
  fitur: string;
  teknologi: string;
}

export interface ExperienceFormData {
  id?: number;
  role: string;
  company: string;
  period: string;
  descriptions: string;
  technologies: string;
}

export type ActiveModal =
  | null
  | 'editHero'
  | 'editAbout'
  | 'editContact'
  | 'addProject'
  | 'editProject'
  | 'editDetail'
  | 'addExperience'
  | 'editExperience'
  | 'deleteConfirm'
  | 'sqlHelper';
