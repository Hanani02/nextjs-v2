import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Memastikan URL gambar valid.
 * Jika hanya diisi nama file (misal: "my-project.jpg"),
 * fungsi ini otomatis mengubahnya menjadi Public URL Supabase Storage di bucket 'portfolio'.
 */
export function resolveImageUrl(urlOrFilename: string | undefined | null, defaultFallback: string = '/image/auroraweb.png'): string {
  if (!urlOrFilename || !urlOrFilename.trim()) return defaultFallback;
  const trimmed = urlOrFilename.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mrkuximhcfynnihdqmsy.supabase.co';
  return `${supabaseUrl}/storage/v1/object/public/portfolio/${trimmed}`;
}

