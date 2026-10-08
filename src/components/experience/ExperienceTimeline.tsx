'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export type Experience = {
  role: string;
  company: string;
  description: string;
  technologies: string[];
};

interface ExperienceTimelineProps {
  experiences: Experience[];
}

export default function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="relative mt-14 overflow-visible">
      {/* Glowing Vertical Timeline Center Line */}
      <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/80 via-primary/30 to-transparent md:-translate-x-1/2 shadow-[0_0_20px_rgba(32,178,166,0.8)] pointer-events-none" />

      <div className="space-y-14">
        {experiences.map((exp, index) => {
          const isEven = index % 2 === 0;
          // Desktop: even items emerge to the left (start tucked +x), odd items emerge to the right (start tucked -x)
          // Mobile: all items emerge to the right of the left-aligned line (start tucked -x)
          const initialX = isDesktop ? (isEven ? 55 : -55) : -35;

          return (
            <div
              key={`${exp.role}-${exp.company}-${index}`}
              className="relative grid md:grid-cols-2 gap-8"
            >
              {/* Timeline Center Node Dot - Emerges on scroll with glow ping */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute left-0 md:left-1/2 top-6 w-3.5 h-3.5 bg-primary rounded-full -translate-x-1/2 ring-4 ring-background z-10 shadow-[0_0_12px_rgba(32,178,166,0.9)]"
              >
                <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
              </motion.div>

              {/* Experience Card - Hidden at first, slides out smoothly from the timeline line */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: initialX,
                  scale: 0.94,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{
                  duration: 0.65,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`pl-8 md:pl-0 ${
                  isEven ? 'md:pr-16 md:text-right' : 'md:col-start-2 md:pl-16'
                }`}
              >
                <div className="group p-6 rounded-2xl bg-card/85 backdrop-blur-md border border-primary/25 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-[0_8px_30px_rgba(32,178,166,0.12)]">
                  <h3 className="text-primary text-xl font-semibold mt-2 group-hover:text-primary transition-colors">
                    {exp.role}
                  </h3>
                  <p className="text-gray-500 font-medium">{exp.company}</p>
                  <p className="text-sm text-gray-400 mt-4 leading-relaxed">{exp.description}</p>

                  <div className={`flex flex-wrap gap-2 mt-4 ${isEven ? 'md:justify-end' : ''}`}>
                    {exp.technologies.map((tech, techIndex) => (
                      <span
                        key={`${tech}-${techIndex}`}
                        className="px-3 py-1 bg-surface text-xs rounded-full text-text/80 border border-border"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
