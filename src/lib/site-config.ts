import fs from 'fs';
import path from 'path';
import { getSupabase, getAdminSupabase } from '@/lib/supabase';
import { resolveImageUrl } from './site-config';

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
    greeting: "── Halo, saya M. Akbar Hanani",
    roles: "Fullstack Developer | Web Developer | Mobile Developer",
    headline: "Membangun pengalaman web modern dengan",
    headlineHighlight: "kode bersih",
    description: "Saya merancang dan membangun aplikasi fullstack yang scalable menggunakan teknologi modern seperti Next.js, TypeScript, dan Supabase. Berfokus pada performa tinggi dan UI yang bersih.",
    profileImage: "/image/profil.jpeg",
    profileImagePosition: "center",
    profileImageScale: 1,
    profileImageFit: "cover",
    ctaContactText: "Hubungi Saya",
    ctaProjectsText: "Lihat Proyek",
  },
  about: {
    badge: "Tentang Saya",
    title: "Membangun aplikasi web yang scalable dan berorientasi pada pengguna",
    description1: "Saya siswa kelas 11 Rekayasa Perangkat Lunak (RPL) di SMKN 1 Kota Pasuruan, bersemangat membangun aplikasi web yang lancar, modern, dan ramah pengguna. Saya senang mengubah ide menjadi pengalaman digital yang fungsional sembari terus meningkatkan keterampilan pengembangan dan desain melalui proyek sekolah dan pribadi.",
    description2: "Saya sering bekerja dengan HTML, CSS, JavaScript, TypeScript, React, Next.js, dan Tailwind CSS, serta MySQL dan dasar Python. Untuk desain dan pembuatan antarmuka, saya biasa menggunakan Figma dan shadcn/ui demi menciptakan pengalaman yang bersih, responsif, dan konsisten.",
    aboutImage: "/image/about.jpeg",
    aboutImagePosition: "center",
    aboutImageScale: 1,
    aboutImageFit: "cover",
    highlights: [
      { title: "Kode Bersih", icon: "code" },
      { title: "Aplikasi Fullstack", icon: "database" },
      { title: "Performa Tinggi", icon: "rocket" },
    ],
  },
  contact: {
    badge: "Kontak",
    title: "Mari bangun sesuatu yang",
    highlight: "luar biasa bersama",
    description: "Punya ide proyek, tawaran kolaborasi, atau ingin berdiskusi? Saya siap mendengarnya. Mari terhubung!",
    email: "akbarhanani02@gmail.com",
    phone: "+62 817 5204 440",
    location: "Pasuruan, Jawa Timur, Indonesia",
  },
};

const configFilePath = path.join(process.cwd(), 'src', 'data', 'site-config.json');

/**
 * Membaca konfigurasi dari file lokal JSON (synchronous fallback)
 */
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

/**
 * Menyimpan konfigurasi ke file lokal JSON (synchronous fallback)
 */
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

export { resolveImageUrl } from '@/lib/utils';

/**
 * Mengambil data Hero secara dinamis dari tabel Supabase `hero` (id = 1).
 * Jika tabel belum ada atau kosong, otomatis fallback ke data lokal/default.
 */
export async function getDynamicHero(): Promise<SiteConfig['hero']> {
  const fallback = getSiteConfig().hero;
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('hero')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      if (error && error.code !== 'PGRST116') {
        console.warn('Supabase hero fetch warning:', error.message);
      }
      return fallback;
    }

    const rawProfileImage = data.profile_image ?? data.profileImage ?? fallback.profileImage;

    return {
      greeting: data.greeting ?? fallback.greeting,
      roles: data.roles ?? fallback.roles,
      headline: data.headline ?? fallback.headline,
      headlineHighlight: data.headline_highlight ?? data.headlineHighlight ?? fallback.headlineHighlight,
      description: data.description ?? fallback.description,
      profileImage: resolveImageUrl (rawProfileImage, fallback.profileImage),
      profileImagePosition: data.profile_image_position ?? data.profileImagePosition ?? fallback.profileImagePosition ?? 'center',
      profileImageScale: data.profile_image_scale != null ? Number(data.profile_image_scale) : (fallback.profileImageScale ?? 1),
      profileImageFit: (data.profile_image_fit || data.profileImageFit || fallback.profileImageFit || 'cover') as 'cover' | 'contain',
      ctaContactText: data.cta_contact_text ?? data.ctaContactText ?? fallback.ctaContactText,
      ctaProjectsText: data.cta_projects_text ?? data.ctaProjectsText ?? fallback.ctaProjectsText,
    };
  } catch (err) {
    console.error('getDynamicHero exception, falling back:', err);
    return fallback;
  }
}

/**
 * Mengambil data About secara dinamis dari tabel Supabase `about` (id = 1).
 * Jika tabel belum ada atau kosong, otomatis fallback ke data lokal/default.
 */
export async function getDynamicAbout(): Promise<SiteConfig['about']> {
  const fallback = getSiteConfig().about;
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('about')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      if (error && error.code !== 'PGRST116') {
        console.warn('Supabase about fetch warning:', error.message);
      }
      return fallback;
    }

    let parsedHighlights = fallback.highlights;
    if (data.highlights) {
      if (Array.isArray(data.highlights)) {
        parsedHighlights = data.highlights;
      } else if (typeof data.highlights === 'string') {
        try {
          parsedHighlights = JSON.parse(data.highlights);
        } catch {
          parsedHighlights = fallback.highlights;
        }
      }
    }

    const rawAboutImage = data.about_image ?? data.aboutImage ?? fallback.aboutImage;

    return {
      badge: data.badge ?? fallback.badge,
      title: data.title ?? fallback.title,
      description1: data.description1 ?? fallback.description1,
      description2: data.description2 ?? fallback.description2,
      aboutImage: resolveImageUrl(rawAboutImage, fallback.aboutImage),
      aboutImagePosition: data.about_image_position ?? data.aboutImagePosition ?? fallback.aboutImagePosition ?? 'center',
      aboutImageScale: data.about_image_scale != null ? Number(data.about_image_scale) : (fallback.aboutImageScale ?? 1),
      aboutImageFit: (data.about_image_fit || data.aboutImageFit || fallback.aboutImageFit || 'cover') as 'cover' | 'contain',
      highlights: parsedHighlights,
    };
  } catch (err) {
    console.error('getDynamicAbout exception, falling back:', err);
    return fallback;
  }
}

/**
 * Mengambil data Contact secara dinamis dari tabel Supabase `contact` (id = 1).
 * Jika tabel belum ada atau kosong, otomatis fallback ke data lokal/default.
 */
export async function getDynamicContact(): Promise<SiteConfig['contact']> {
  const fallback = getSiteConfig().contact;
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('contact')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      if (error && error.code !== 'PGRST116' && error.code !== 'PGRST205') {
        console.warn('Supabase contact fetch warning:', error.message);
      }
      return fallback;
    }

    return {
      badge: data.badge ?? fallback.badge,
      title: data.title ?? fallback.title,
      highlight: data.highlight ?? fallback.highlight,
      description: data.description ?? fallback.description,
      email: data.email ?? fallback.email,
      phone: data.phone ?? fallback.phone,
      location: data.location ?? fallback.location,
    };
  } catch (err) {
    console.error('getDynamicContact exception, falling back:', err);
    return fallback;
  }
}

/**
 * Mengambil konfigurasi lengkap secara asynchronous dari Supabase
 */
export async function getSiteConfigAsync(): Promise<SiteConfig> {
  const [hero, about, contact] = await Promise.all([
    getDynamicHero(),
    getDynamicAbout(),
    getDynamicContact(),
  ]);

  return {
    hero,
    about,
    contact,
  };
}

/**
 * Menyimpan data hero ke Supabase (tabel `hero`)
 */
export async function saveHeroToSupabase(heroData: Partial<SiteConfig['hero']>): Promise<void> {
  const adminSupabase = getAdminSupabase();
  const payload: Record<string, unknown> = {
    id: 1,
    updated_at: new Date().toISOString(),
  };

  if (heroData.greeting !== undefined) payload.greeting = heroData.greeting;
  if (heroData.roles !== undefined) payload.roles = heroData.roles;
  if (heroData.headline !== undefined) payload.headline = heroData.headline;
  if (heroData.headlineHighlight !== undefined) payload.headline_highlight = heroData.headlineHighlight;
  if (heroData.description !== undefined) payload.description = heroData.description;
  if (heroData.profileImage !== undefined) payload.profile_image = heroData.profileImage;
  if (heroData.profileImagePosition !== undefined) payload.profile_image_position = heroData.profileImagePosition;
  if (heroData.profileImageScale !== undefined) payload.profile_image_scale = heroData.profileImageScale;
  if (heroData.profileImageFit !== undefined) payload.profile_image_fit = heroData.profileImageFit;
  if (heroData.ctaContactText !== undefined) payload.cta_contact_text = heroData.ctaContactText;
  if (heroData.ctaProjectsText !== undefined) payload.cta_projects_text = heroData.ctaProjectsText;

  const { error } = await adminSupabase
    .from('hero')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.warn('Gagal menyimpan ke tabel hero di Supabase:', error.message);
    throw new Error(error.message);
  }
}

/**
 * Menyimpan data about ke Supabase (tabel `about`)
 */
export async function saveAboutToSupabase(aboutData: Partial<SiteConfig['about']>): Promise<void> {
  const adminSupabase = getAdminSupabase();
  const payload: Record<string, unknown> = {
    id: 1,
    updated_at: new Date().toISOString(),
  };

  if (aboutData.badge !== undefined) payload.badge = aboutData.badge;
  if (aboutData.title !== undefined) payload.title = aboutData.title;
  if (aboutData.description1 !== undefined) payload.description1 = aboutData.description1;
  if (aboutData.description2 !== undefined) payload.description2 = aboutData.description2;
  if (aboutData.aboutImage !== undefined) payload.about_image = aboutData.aboutImage;
  if (aboutData.aboutImagePosition !== undefined) payload.about_image_position = aboutData.aboutImagePosition;
  if (aboutData.aboutImageScale !== undefined) payload.about_image_scale = aboutData.aboutImageScale;
  if (aboutData.aboutImageFit !== undefined) payload.about_image_fit = aboutData.aboutImageFit;
  if (aboutData.highlights !== undefined) payload.highlights = aboutData.highlights;

  const { error } = await adminSupabase
    .from('about')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.warn('Gagal menyimpan ke tabel about di Supabase:', error.message);
    throw new Error(error.message);
  }
}

/**
 * Menyimpan data contact ke Supabase (tabel `contact`)
 */
export async function saveContactToSupabase(contactData: Partial<SiteConfig['contact']>): Promise<void> {
  const adminSupabase = getAdminSupabase();
  const payload: Record<string, unknown> = {
    id: 1,
    updated_at: new Date().toISOString(),
  };

  if (contactData.badge !== undefined) payload.badge = contactData.badge;
  if (contactData.title !== undefined) payload.title = contactData.title;
  if (contactData.highlight !== undefined) payload.highlight = contactData.highlight;
  if (contactData.description !== undefined) payload.description = contactData.description;
  if (contactData.email !== undefined) payload.email = contactData.email;
  if (contactData.phone !== undefined) payload.phone = contactData.phone;
  if (contactData.location !== undefined) payload.location = contactData.location;

  const { error } = await adminSupabase
    .from('contact')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.warn('Catatan: Supabase contact upsert warning (tabel belum ada di database):', error.message);
  }
}

/**
 * Menyimpan konfigurasi secara asynchronous baik ke Supabase maupun ke file lokal
 */
export async function saveSiteConfigAsync(newConfig: Partial<SiteConfig>): Promise<SiteConfig> {
  // 1. Sinkronisasi ke Supabase
  if (newConfig.hero) {
    try {
      await saveHeroToSupabase(newConfig.hero);
    } catch (err) {
      console.warn('Catatan: Supabase hero upsert fallback ke local storage:', err);
    }
  }

  if (newConfig.about) {
    try {
      await saveAboutToSupabase(newConfig.about);
    } catch (err) {
      console.warn('Catatan: Supabase about upsert fallback ke local storage:', err);
    }
  }

  if (newConfig.contact) {
    try {
      await saveContactToSupabase(newConfig.contact);
    } catch (err) {
      console.warn('Catatan: Supabase contact upsert fallback ke local storage:', err);
    }
  }

  // 2. Simpan juga ke file JSON lokal sebagai cadangan
  try {
    saveSiteConfig(newConfig);
  } catch (err) {
    console.warn('Catatan: Penyimpanan file lokal dilewati:', err);
  }

  // 3. Ambil data terbaru
  return await getSiteConfigAsync();
}

