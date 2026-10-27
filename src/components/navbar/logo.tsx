"use client";

import Link from "next/link";
import { LuCodeXml } from "react-icons/lu";
import { smoothScrollTo } from "@/lib/smoothScroll";

export default function Logo() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      typeof window !== "undefined" &&
      (window.location.pathname === "/" || window.location.pathname === "")
    ) {
      e.preventDefault();
      smoothScrollTo(0, {
        onComplete: () => {
          window.history.replaceState(null, "", "/#home");
        },
      });
    }
  };

  return (
    <Link
      href="/#home"
      scroll={false}
      onClick={handleClick}
      aria-label="Kanagara Studio - Home"
      className="flex items-center gap-3 group cursor-pointer"
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface border border-border text-primary shadow-sm group-hover:scale-105 group-hover:border-primary transition-all duration-300">
        <LuCodeXml className="w-5 h-5" />
      </div>

      <p className="hidden sm:block font-semibold text-lg md:text-xl tracking-wide text-text group-hover:text-primary transition-colors duration-300">
        Kanagara Studio
      </p>
    </Link>
  );
}