import fs from 'fs';
import path from 'path';

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

export const defaultSiteConfig: SiteConfig = {
  hero: {
    greeting: "── Hello I'm M. Akbar Hanani",
    roles: "Fullstack Developer | Web Developer | Mobile Developer",
    headline: "Building modern web experience with",
    headlineHighlight: "clean code",
    description: "I design and build scalable fullstack applications using modern technologies like Next.js, TypeScript, and Supabase. Focused on performance, clean UI.",
    profileImage: "/image/profil.jpeg",
    profileImagePosition: "center",
    profileImageScale: 1,
    profileImageFit: "cover",
    ctaContactText: "get in touch",
    ctaProjectsText: "View projects",
  },
  about: {
    badge: "About Me",
    title: "I build scalable and user-focused web applications",
    description1: "I'm a Grade 11 Software Engineering (RPL) student at SMKN 1 Kota Pasuruan, passionate about building smooth, modern, and user-friendly web applications. I enjoy turning ideas into functional digital experiences while continuously improving my development and design skills through school and personal projects.",
    description2: "I frequently work with HTML, CSS, JavaScript, TypeScript, React, Next.js, and Tailwind CSS, along with MySQL and basic Python. For design and interface development, I often use Figma and shadcn/ui to create clean, responsive, and consistent experiences.",
    aboutImage: "/image/about.jpeg",
    aboutImagePosition: "center",
    aboutImageScale: 1,
    aboutImageFit: "cover",
    highlights: [
      { title: "Clean code", icon: "code" },
      { title: "Fullstack Apps", icon: "database" },
      { title: "Performance", icon: "rocket" },
    ],
  },
  contact: {
    badge: "Contact",
    title: "Let's build something great",
    highlight: "something great",
    description: "Have a project in mind? I'd love to hear about it. Let's connect.",
    email: "akbarhanani02@gmail.com",
    phone: "+62 817 5204 440",
    location: "Pasuruan, Jawa Timur, Indonesia",
  },
};

const configFilePath = path.join(process.cwd(), 'src', 'data', 'site-config.json');

export function getSiteConfig(): SiteConfig {
  try {
    if (fs.existsSync(configFilePath)) {
      const fileData = fs.readFileSync(configFilePath, 'utf8');
      const parsed = JSON.parse(fileData);
      return {
        hero: { ...defaultSiteConfig.hero, ...parsed.hero },
        about: { ...defaultSiteConfig.about, ...parsed.about },
        contact: { ...defaultSiteConfig.contact, ...parsed.contact },
      };
    }
  } catch (err) {
    console.error('Error reading site-config.json:', err);
  }
  return defaultSiteConfig;
}

export function saveSiteConfig(newConfig: Partial<SiteConfig>): SiteConfig {
  const current = getSiteConfig();
  const merged: SiteConfig = {
    hero: { ...current.hero, ...(newConfig.hero || {}) },
    about: { ...current.about, ...(newConfig.about || {}) },
    contact: { ...current.contact, ...(newConfig.contact || {}) },
  };

  try {
    const dir = path.dirname(configFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configFilePath, JSON.stringify(merged, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing site-config.json:', err);
  }

  return merged;
}
