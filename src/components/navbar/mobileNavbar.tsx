"use client";

import { navLinks } from "./navbar";
import Link from "next/link";
import { Icon } from "@iconify/react";
import ThemeToggle from "../theme/ThemeToggle";
import SoundToggle from "../theme/SoundToggle";
import { LuDownload } from "react-icons/lu";

const navIcons = {
  Home: "akar-icons:home-alt1",
  About: "akar-icons:person",
  Projects: "akar-icons:folder",
  Experience: "lucide:chart-no-axes-combined",
  Contact: "akar-icons:envelope",
};

interface MobileNavProps {
  navOpen: boolean;
  onClose?: () => void;
  activeSection?: string;
}

export default function MobileNavbar({ navOpen, onClose, activeSection = "home" }: MobileNavProps) {
  return (
    <>
      {/* overlay */}
      <div
        data-mobile-navbar
        onClick={onClose}
        className={`fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm transition-all duration-500 cursor-pointer ${
          navOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      />

      <aside
        data-mobile-navbar
        className={`fixed top-0 right-0 z-50 h-full w-[80%] sm:w-[60%] lg:hidden bg-surface/90 backdrop-blur-2xl border-l border-border flex flex-col justify-between p-6 transition-all duration-500 shadow-2xl ${
          navOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="pt-16 space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Menu</p>
          <ul className="space-y-1.5">
            {navLinks.map((link, index) => {
              const isActive = activeSection === link.id;
              return (
                <li key={index}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={`w-full flex items-center justify-between py-3 px-4 rounded-xl text-base font-medium transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] ${
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/35 shadow-[0_0_15px_rgba(59,130,246,0.2)] font-semibold"
                        : "text-text border border-transparent hover:bg-surface/80 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon
                        icon={navIcons[link.label as keyof typeof navIcons]}
                        width="20"
                        height="20"
                        className={isActive ? "text-primary" : "text-text/70"}
                      />
                      <span>{link.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom controls: Audio FX, Theme Switcher and Download CV */}
        <div className="space-y-3 pt-5 border-t border-border">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-medium text-text/80">Suara Balapan</span>
            <SoundToggle size="sm" showLabel />
          </div>

          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-medium text-text/80">Tema Tampilan</span>
            <ThemeToggle size="sm" showLabel />
          </div>

          <a
            href="/cv.png"
            download
            className="w-full py-3 px-4 rounded-xl border border-border bg-background text-text hover:text-primary hover:border-primary hover:bg-primary/10 font-medium text-sm flex items-center justify-center gap-2 transition-all"
          >
            <LuDownload className="w-4 h-4" />
            <span>Download CV</span>
          </a>
        </div>
      </aside>
    </>
  );
}
