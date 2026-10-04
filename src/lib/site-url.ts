/**
 * Centralized site URL and domain configuration.
 * Can be overridden with NEXT_PUBLIC_SITE_URL in .env
 */
export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")) ||
  "https://www.akbar-hanani.my.id";

export const SITE_DOMAIN = "www.akbar-hanani.my.id";
