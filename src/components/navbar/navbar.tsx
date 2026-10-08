"use client";

import { useState, useEffect } from "react";
import MobileNavbar from "./mobileNavbar";
import Logo from "./logo";
import Link from "next/link";
import LinkButton from "../ui/LinkButton";
import ThemeToggle from "../theme/ThemeToggle";
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
        className={`fixed top-0 left-0 w-full z-60 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-2xl bg-background/80 border-b border-border/60 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="w-[95%] lg:w-[90%] mx-auto h-16 flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop navigation */}
          <ul className="hidden lg:flex items-center gap-1 py-2 px-2.5 rounded-full bg-surface/70 backdrop-blur-xl border border-border shadow-sm">
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

          {/* Desktop actions: Theme Toggle & Download CV */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle size="md" />
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

          {/* Mobile actions: Theme Toggle & Hamburger menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle size="sm" />
            <button
              onClick={() => setNavOpen(!navOpen)}
              aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
              className="z-50 w-10 h-10 rounded-xl flex items-center justify-center border border-border bg-surface/70 text-text hover:border-primary hover:text-primary transition shadow-sm cursor-pointer"
            >
              {navOpen ? <LuX size={22} /> : <LuMenu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <MobileNavbar navOpen={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
