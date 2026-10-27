"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import MobileNavbar from "./mobileNavbar";
import Logo from "./logo";
import Link from "next/link";
import LinkButton from "../ui/LinkButton";
import ThemeToggle from "../theme/ThemeToggle";
import SoundToggle from "../theme/SoundToggle";
import LanguageToggle from "../theme/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import { LuDownload, LuX, LuMenu } from "react-icons/lu";

export const navLinks = [
  { href: "/#home", id: "home", label: "Home", key: "nav_home" as const },
  { href: "/#about", id: "about", label: "About", key: "nav_about" as const },
  { href: "/#projects", id: "projects", label: "Projects", key: "nav_projects" as const },
  { href: "/#experience", id: "experience", label: "Experience", key: "nav_experience" as const },
  { href: "/#contact", id: "contact", label: "Contact", key: "nav_contact" as const },
];

export default function Navbar() {
  const { dictionary } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Hanya deteksi scroll section ketika berada di halaman utama "/"
      if (pathname === "/" || pathname === "") {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // 1. Jika sudah dekat bagian paling bawah halaman, aktifkan contact
        if (scrollPosition + windowHeight >= documentHeight - 80) {
          setActiveSection("contact");
          return;
        }

        // 2. Jika di puncak halaman, aktifkan home
        if (scrollPosition < 120) {
          setActiveSection("home");
          return;
        }

        // 3. Deteksi section aktif secara berurutan sesuai trigger point viewport
        const triggerPoint = Math.min(260, windowHeight * 0.35);
        let current = "home";

        for (const link of navLinks) {
          const el = document.getElementById(link.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= triggerPoint) {
              current = link.id;
            }
          }
        }

        setActiveSection(current);
      } else if (pathname?.toLowerCase().startsWith("/project")) {
        setActiveSection("projects");
      } else {
        setActiveSection("");
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Smooth scroll handler saat mengklik link section navbar di halaman beranda
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
    if (pathname === "/" || pathname === "") {
      e.preventDefault();
      const target = document.getElementById(id);
      if (target) {
        const navOffset = 90;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = id === "home" ? 0 : elementPosition + window.pageYOffset - navOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        window.history.pushState(null, "", href);
        setActiveSection(id);
      }
    }
  };

  // Smooth scroll ke section jika datang dari halaman lain dengan hash di URL
  useEffect(() => {
    if (pathname === "/" || pathname === "") {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        const timer = setTimeout(() => {
          const target = document.getElementById(hash);
          if (target) {
            const navOffset = 90;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = hash === "home" ? 0 : elementPosition + window.pageYOffset - navOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
            setActiveSection(hash);
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);

  return (
    <>
      <header className="fixed top-3 sm:top-5 inset-x-0 mx-auto w-[94%] sm:w-[90%] max-w-6xl z-50 transition-all duration-300 pointer-events-auto">
        <nav
          className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl sm:rounded-full flex items-center justify-between transition-all duration-300 ease-out ${
            scrolled
              ? "bg-surface/75 dark:bg-surface/70 backdrop-blur-2xl border border-border/70 shadow-[0_12px_36px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
              : "bg-surface/35 dark:bg-surface/30 backdrop-blur-xl border border-border/50 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
          }`}
        >
          {/* Logo dengan smooth hover scale */}
          <div className="transition-transform duration-300 ease-out hover:scale-105 active:scale-95">
            <Logo />
          </div>

          {/* Desktop navigation: menu menyala sesuai section aktif & smooth hover scale */}
          <ul className="hidden lg:flex items-center gap-1 py-1 px-1.5 rounded-full bg-surface/50 dark:bg-surface/40 backdrop-blur-md border border-border/40 shadow-inner">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              const localizedLabel = dictionary[link.key] || link.label;
              return (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.id)}
                    className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ease-out inline-flex items-center justify-center transform hover:scale-105 active:scale-95 cursor-pointer ${
                      isActive
                        ? "bg-primary/20 text-primary border border-primary/40 font-semibold shadow-[0_0_15px_rgba(59,130,246,0.35)]"
                        : "text-text/75 hover:text-primary hover:bg-surface/80 border border-transparent"
                    }`}
                  >
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block mr-1.5 animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
                    )}
                    <span>{localizedLabel}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop actions: Download CV & Toggles dengan smooth hover scale */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="transition-transform duration-300 ease-out hover:scale-105 active:scale-95">
              <LinkButton
                iconPosition="Left"
                icon={LuDownload}
                rounded
                variant="outline"
                text={dictionary.nav_download_cv}
                href="/cv.png"
                download
              />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="transition-transform duration-300 ease-out hover:scale-105 active:scale-95">
                <LanguageToggle size="md" />
              </div>
              <div className="transition-transform duration-300 ease-out hover:scale-105 active:scale-95">
                <SoundToggle size="md" />
              </div>
              <div className="transition-transform duration-300 ease-out hover:scale-105 active:scale-95">
                <ThemeToggle size="md" />
              </div>
            </div>
          </div>

          {/* Mobile actions: Language, Sound, Theme Toggle & Hamburger menu dengan smooth hover scale */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <div className="transition-transform duration-300 ease-out hover:scale-105 active:scale-95">
              <LanguageToggle size="sm" />
            </div>
            <div className="transition-transform duration-300 ease-out hover:scale-105 active:scale-95">
              <SoundToggle size="sm" />
            </div>
            <div className="transition-transform duration-300 ease-out hover:scale-105 active:scale-95">
              <ThemeToggle size="sm" />
            </div>
            <button
              onClick={() => setNavOpen(!navOpen)}
              aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-surface/70 text-text hover:border-primary hover:text-primary hover:scale-105 active:scale-95 transition-all duration-300 ease-out shadow-sm cursor-pointer"
            >
              {navOpen ? <LuX size={20} /> : <LuMenu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      <MobileNavbar
        navOpen={navOpen}
        onClose={() => setNavOpen(false)}
        activeSection={activeSection}
      />
    </>
  );
}

