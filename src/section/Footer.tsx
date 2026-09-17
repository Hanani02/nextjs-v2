import Logo from "@/components/navbar/logo";
import { LuGithub, LuInstagram } from "react-icons/lu";
import { FaDiscord } from "react-icons/fa6";
import Link from "next/link";

const quickLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/Project" },
  { label: "Experience", href: "/#experience" },
];

const socials = [
  { icon: LuGithub, href: "https://github.com/Hanani02", label: "GitHub" },
  { icon: FaDiscord, href: "https://discord.com/users/10737232961153433611", label: "Discord" },
  { icon: LuInstagram, href: "https://www.instagram.com/hanannreal/", label: "Instagram" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-background overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10"/>

      <div className="w-[90%] max-w-6xl mx-auto py-14 space-y-10 relative z-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_1fr] md:items-start">
          <div className="space-y-3 max-w-xs">
            <div className="flex justify-center md:justify-start">
              <Logo />
            </div>
            <p className="text-sm text-gray-300">
              Crafting modern, scalable web experiences with clean code and thoughtful design.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Navigasi</p>
            <div className="flex flex-col gap-2 text-sm text-gray-300">
              {quickLinks.map((link) => (
                <Link key={link.label} href={link.href} className="transition hover:text-primary">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Social</p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-border text-gray-300 hover:text-primary hover:border-primary hover:shadow-[0_0_20px_rgba(32,178,166,0.2)] transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <p className="text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Kanagara Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
