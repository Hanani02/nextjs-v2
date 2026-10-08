import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layouts/AppShell";
import { ThemeProvider } from "@/context/ThemeContext";
import { SITE_URL } from "@/lib/site-url";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Muhammad Akbar Hanani | Fullstack & Web Developer Portfolio",
    template: "%s | Muhammad Akbar Hanani",
  },
  description:
    "Portofolio Muhammad Akbar Hanani (Hanan) - Fullstack & Web Developer yang berfokus pada pembuatan aplikasi web modern, responsif, dan performan menggunakan Next.js, React, TypeScript, Tailwind CSS, dan Supabase.",
  keywords: [
    "Muhammad Akbar Hanani",
    "Akbar Hanani",
    "Hanan Portfolio",
    "Fullstack Developer",
    "Web Developer Indonesia",
    "Next.js Developer",
    "React Developer",
    "TypeScript",
    "Supabase",
    "Tailwind CSS",
    "Frontend Developer",
    "Software Engineer Pasuruan",
  ],
  authors: [{ name: "Muhammad Akbar Hanani", url: siteUrl }],
  creator: "Muhammad Akbar Hanani",
  publisher: "Muhammad Akbar Hanani",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "Muhammad Akbar Hanani Portfolio",
    title: "Muhammad Akbar Hanani | Portfolio",
    description:
      "Software Developer & UI/UX Designer. Showcase proyek web development modern dan solusi fullstack engineering.",
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Muhammad Akbar Hanani - Software Developer & UI/UX Designer",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhammad Akbar Hanani | Portfolio",
    description:
      "Software Developer & UI/UX Designer. Showcase proyek web development modern dan solusi fullstack engineering.",
    images: [`${siteUrl}/opengraph-image`],
    creator: "@akbarhanani02",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  category: "technology",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-theme="dark"
      suppressHydrationWarning
      className={`${poppins.className} ${poppins.variable} h-full antialiased dark`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('portfolio-theme');
                  var theme = saved === 'light' ? 'light' : 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.style.colorScheme = 'dark';
                  }
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-text transition-colors duration-300">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
