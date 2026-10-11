"use client";

import { useState, useEffect } from "react";
import MobileNavbar from "./mobileNavbar";
import Logo from "./logo";
import Link from "next/link";
import LinkButton from "../ui/LinkButton";
import ThemeToggle from "../theme/ThemeToggle";
import SoundToggle from "../theme/SoundToggle";
import { LuDownload, LuX, LuMenu } from "react-icons/lu";

export const navLinks = [
  { href: "/#home", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-2xl bg-background/80 border-b border-border/60 shadow-sm py-0"
            : "bg-transparent py-1 pointer-events-none"
        }`}
      >
        <div className="w-[95%] lg:w-[90%] mx-auto h-16 flex items-center justify-between">
          {/* Logo (Always visible) */}
          <div className="pointer-events-auto">
            <Logo />
          </div>

          {/* Desktop navigation (Hidden on initial scroll=0, fades in on scroll) */}
          <ul
            className={`hidden lg:flex items-center gap-1 py-2 px-2.5 rounded-full bg-surface/70 backdrop-blur-xl border border-border shadow-sm transition-all duration-500 ease-out ${
              scrolled
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
          >
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link
                  href={link.href}
                  className="px-4 py-1.5 rounded-full text-sm font-medium text-text/75 transition-all duration-300 hover:text-primary hover:bg-surface"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop actions: Theme Toggle (Always visible) & Download CV (Hidden initially, appears on scroll) */}
          <div className="hidden lg:flex items-center gap-3">
            <div
              className={`transition-all duration-500 ease-out ${
                scrolled
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-4 pointer-events-none"
              }`}
            >
              <LinkButton
                iconPosition="Left"
                icon={LuDownload}
                rounded
                variant="outline"
                text="Download CV"
                href="/cv.png"
                download
              />
            </div>
            <div className="flex items-center gap-2 pointer-events-auto">
              <SoundToggle size="md" />
              <ThemeToggle size="md" />
            </div>
          </div>

          {/* Mobile actions: Sound & Theme Toggle (Always visible) & Hamburger menu (Appears on scroll) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <SoundToggle size="sm" />
              <ThemeToggle size="sm" />
            </div>
            <div
              className={`transition-all duration-500 ease-out ${
                scrolled
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-4 pointer-events-none"
              }`}
            >
              <button
                onClick={() => setNavOpen(!navOpen)}
                aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-border bg-surface/70 text-text hover:border-primary hover:text-primary transition shadow-sm cursor-pointer"
              >
                {navOpen ? <LuX size={22} /> : <LuMenu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileNavbar navOpen={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
