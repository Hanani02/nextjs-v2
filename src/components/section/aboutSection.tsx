"use client";

import Image from "next/image";
import { LuCode, LuDatabase, LuRocket } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import type { SiteConfig } from "@/types/admin";

interface AboutSectionProps {
  initialAbout?: SiteConfig['about'];
}

export default function AboutSection({ initialAbout }: AboutSectionProps = {}) {
  const { dictionary, isId } = useLanguage();

  const about = initialAbout || {
    badge: "Tentang Saya",
    title: "Membangun aplikasi web yang scalable dan berorientasi pada pengguna",
    description1: "",
    description2: "",
    aboutImage: "/image/about.jpeg",
    aboutImagePosition: "center",
    aboutImageScale: 1,
    aboutImageFit: "cover" as const,
    highlights: [],
  };

  const badge = about.badge && !about.badge.includes("About Me")
    ? about.badge
    : dictionary.about_badge;

  const title = about.title && !about.title.includes("I build scalable")
    ? about.title
    : (isId ? dictionary.about_title : "I build scalable and user-focused web applications");

  const desc1 = about.description1 && !about.description1.includes("I'm a Grade 11 Software Engineering")
    ? about.description1
    : (isId ? dictionary.about_desc1 : "I'm a Grade 11 Software Engineering (RPL) student at SMKN 1 Kota Pasuruan, passionate about building smooth, modern, and user-friendly web applications. I enjoy turning ideas into functional digital experiences while continuously improving my development and design skills through school and personal projects.");

  const desc2 = about.description2 && !about.description2.includes("I frequently work with")
    ? about.description2
    : (isId ? dictionary.about_desc2 : "I frequently work with HTML, CSS, JavaScript, TypeScript, React, Next.js, and Tailwind CSS, along with MySQL and basic Python. For design and interface development, I often use Figma and shadcn/ui to create clean, responsive, and consistent experiences.");

  const highlightItems = [
    { title: dictionary.about_highlight_code, icon: "code" },
    { title: dictionary.about_highlight_fullstack, icon: "database" },
    { title: dictionary.about_highlight_performance, icon: "rocket" },
  ];

  return (
    <section id="about" className="py-24 overflow-hidden relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10 pointer-events-none" />
      <div className="w-[90%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* leftside */}
        <div
          data-aos="fade-right"
          data-aos-delay="100"
          data-aos-anchor-placement="top-center"
          className="flex justify-center lg:justify-start"
        >
          <div className="relative w-85 h-85 md:w-120 md:h-120 rounded-2xl bg-surface/80 backdrop-blur-md border border-border flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-2xl pointer-events-none" />

            <div className="w-[85%] h-[85%] relative overflow-hidden rounded-xl">
              <Image
                fill
                src={about.aboutImage || "/image/about.jpeg"}
                alt="Foto Muhammad Akbar Hanani - Tentang Pengalaman dan Keahlian Web Development"
                sizes="(max-width: 768px) 300px, 480px"
                className="z-10 rounded-xl transition-transform duration-300"
                style={{
                  objectFit: about.aboutImageFit || 'cover',
                  objectPosition: about.aboutImagePosition || 'center',
                  transform: `scale(${about.aboutImageScale || 1})`,
                }}
              />
            </div>
          </div>
        </div>

        {/* rightside */}
        <div
          className="space-y-6"
          data-aos="fade-left"
          data-aos-delay="100"
          data-aos-anchor-placement="top-center"
        >
          <span className="text-sm text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-border inline-block font-semibold">
            {badge}
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-text leading-tight">
            {title}
          </h2>

          <p className="text-gray-400 max-w-xl leading-relaxed">
            {desc1}
          </p>
          <p className="text-gray-400 max-w-xl leading-relaxed">
            {desc2}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {highlightItems.map((item, index) => {
              const Icon = item.icon === 'database'
                ? LuDatabase
                : item.icon === 'rocket'
                ? LuRocket
                : LuCode;

              return (
                <div key={index} className="p-4 rounded-xl bg-surface border border-border text-center hover:border-primary/50 hover:shadow-md transition-all duration-300">
                  <Icon className="mx-auto mb-2 text-primary w-6 h-6" />
                  <p className="text-text text-sm font-medium">{item.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
