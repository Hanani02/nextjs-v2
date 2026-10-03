'use client';

import Image from 'next/image';
import {
  LuCode,
  LuDatabase,
  LuPencil,
  LuRocket,
  LuUpload,
  LuUser,
} from 'react-icons/lu';

import type { SiteConfig } from '@/types/admin';
import AboutFeatureCard from './AboutFeatureCard';

interface AboutPreviewProps {
  about: SiteConfig['about'] | undefined;
  onEdit: () => void;
}

export default function AboutPreview({
  about,
  onEdit,
}: AboutPreviewProps) {
  return (
    <section
      id="about-admin"
      className="relative overflow-hidden border-b border-border/50 py-24"
    >
      {/* Background Decoration */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto w-[90%] max-w-6xl space-y-10">

        {/* Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            <LuUser className="h-3.5 w-3.5" />
            About Section
          </span>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-background shadow-lg shadow-primary/25 transition hover:bg-blue-400"
          >
            <LuPencil className="h-3.5 w-3.5" />
            Edit About
          </button>
        </div>

        {/* About Content */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

          {/* Image */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative h-72 w-72 rounded-2xl border border-border bg-surface/80 p-4 backdrop-blur-md md:h-96 md:w-96">

              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-primary/10 blur-2xl" />

              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <Image
                  fill
                  src={about?.aboutImage || '/image/about.jpeg'}
                  alt="About Me"
                  className="z-10 rounded-xl transition-transform duration-300"
                  style={{
                    objectFit: about?.aboutImageFit || 'cover',
                    objectPosition: about?.aboutImagePosition || 'center',
                    transform: `scale(${about?.aboutImageScale || 1})`,
                  }}
                  unoptimized
                />
              </div>

              {/* Edit Image */}
              <button
                type="button"
                onClick={onEdit}
                title="Ganti Foto About"
                className="absolute bottom-4 right-4 z-20 rounded-full bg-primary p-2.5 text-background shadow-xl transition hover:scale-110"
              >
                <LuUpload className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-5">

            {/* Badge */}
            <span className="inline-block rounded-full border border-border bg-primary/10 px-3.5 py-1 text-xs text-primary">
              {about?.badge || 'About Me'}
            </span>

            {/* Title */}
            <h2 className="text-2xl font-bold leading-tight text-text md:text-3xl">
              {about?.title ||
                'I build scalable and user-focused web applications'}
            </h2>

            {/* Description */}
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-gray-400">
                {about?.description1 ||
                  "I'm a Grade 11 Software Engineering student passionate about building modern web applications."}
              </p>

              <p className="text-sm leading-relaxed text-gray-400">
                {about?.description2 ||
                  'I frequently work with HTML, CSS, JavaScript, TypeScript, React, Next.js, and Tailwind CSS.'}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 pt-3">
              <AboutFeatureCard
                icon={<LuCode />}
                title="Clean Code"
              />

              <AboutFeatureCard
                icon={<LuDatabase />}
                title="Fullstack Apps"
              />

              <AboutFeatureCard
                icon={<LuRocket />}
                title="Performance"
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}