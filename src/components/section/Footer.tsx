"use client";

import Logo from "@/components/navbar/logo";
import { LuGithub, LuInstagram } from "react-icons/lu";
import { FaDiscord } from "react-icons/fa6";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { smoothScrollToSection } from "@/lib/smoothScroll";

const socials = [
  { icon: LuGithub, href: "https://github.com/Hanani02", label: "GitHub" },
  { icon: FaDiscord, href: "https://discord.com/users/10737232961153433611", label: "Discord" },
  { icon: LuInstagram, href: "https://www.instagram.com/hanannreal/", label: "Instagram" },
];

export default function Footer() {
  const { dictionary } = useLanguage();

  const quickLinks = [
    { label: dictionary.nav_home, href: "/#home", id: "home" },
    { label: dictionary.nav_about, href: "/#about", id: "about" },
    { label: dictionary.nav_projects, href: "/Project", id: "" },
    { label: dictionary.nav_experience, href: "/#experience", id: "experience" },
    { label: dictionary.nav_contact, href: "/#contact", id: "contact" },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id?: string) => {
    if (
      id &&
      typeof window !== "undefined" &&
      (window.location.pathname === "/" || window.location.pathname === "")
    ) {
      e.preventDefault();
      smoothScrollToSection(id, {
        onComplete: () => {
          window.history.replaceState(null, "", href);
        },
      });
    }
  };

  return (
    <footer className="relative border-t border-border bg-background overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10 pointer-events-none"/>

      <div className="w-[90%] max-w-6xl mx-auto py-14 space-y-10 relative z-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_1fr] md:items-start">
          <div className="space-y-3 max-w-xs">
            <div className="flex justify-center md:justify-start">
              <Logo />
            </div>
            <p className="text-sm text-text/75 leading-relaxed">
              {dictionary.footer_tagline}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{dictionary.footer_navigation}</p>
            <div className="flex flex-col gap-2.5 text-sm text-text/75">
              {quickLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  scroll={false}
                  onClick={(e) => handleLinkClick(e, link.href, link.id)}
                  className="transition hover:text-primary cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{dictionary.footer_social}</p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-border text-text/75 hover:text-primary hover:border-primary hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <p className="text-center text-text/60 text-xs sm:text-sm">
          &copy; {new Date().getFullYear()} Muhammad Akbar Hanani. {dictionary.footer_copyright}
        </p>
      </div>
    </footer>
  );
}
