import Image from "next/image";
import { LuCode, LuDatabase, LuRocket } from "react-icons/lu";
import { getDynamicAbout } from "@/lib/site-config";
import type { SiteConfig } from "@/types/admin";

interface AboutSectionProps {
  initialAbout?: SiteConfig['about'];
}

export default async function AboutSection({ initialAbout }: AboutSectionProps = {}) {
  const about = initialAbout ?? (await getDynamicAbout());

  const highlights = (about.highlights && about.highlights.length > 0)
    ? about.highlights
    : [
        { title: "Clean code", icon: "code" },
        { title: "Fullstack Apps", icon: "database" },
        { title: "Performance", icon: "rocket" },
      ];

  return (
    <section id="about" className="py-24 overflow-hidden relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10" />
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
          <span className="text-sm text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-border inline-block">
            {about.badge || "About Me"}
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-text leading-tight">
            {about.title || "I build scalable and user-focused web applications"}
          </h2>

          <p className="text-gray-400 max-w-xl">
            {about.description1}
          </p>
          <p className="text-gray-400 max-w-xl">
            {about.description2}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {highlights.map((item, index) => {
              const Icon = item.icon === 'database'
                ? LuDatabase
                : item.icon === 'rocket'
                ? LuRocket
                : LuCode;

              return (
                <div key={index} className="p-4 rounded-xl bg-surface border border-border text-center">
                  <Icon className="mx-auto mb-2 text-primary w-6 h-6" />
                  <p className="text-text text-sm">{item.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

