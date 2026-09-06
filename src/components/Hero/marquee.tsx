'use client'

import {
  siFigma,
  siNextdotjs,
  siReact,
  siTypescript,
  siTailwindcss,
  siJavascript,
  siSupabase
} from "simple-icons";

const apps = [
    { name: "Figma", icon: siFigma },
    { name: "Next.js", icon: siNextdotjs },
    { name: "React", icon: siReact },
    { name: "TypeScript", icon: siTypescript },
    { name: "Tailwind CSS", icon: siTailwindcss },
    { name: "JavaScript", icon: siJavascript },
    { name: "Supabase", icon: siSupabase },
];

export default function marquee() {
  return (
    <div className="w-full overflow-hidden border-y border-white/10 bg-black/30 py-4 backdrop-blur-sm">
        <div className="flex w-max animate-marquee">
            <div className="flex items-center gap-12 pr-12">
          {apps.map((app) => (
            <div
              key={app.name}
              className="flex items-center gap-3 whitespace-nowrap"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 fill-current text-blue-500"
              >
                <path d={app.icon.path} />
              </svg>

              <span className="text-white">
                {app.name}
              </span>

            </div>
          ))}
        </div>

          {/* layer 2 */}
        <div className="flex items-center gap-12 pr-12">
          {apps.map((app) => (
            <div
              key={`copy-${app.name}`}
              className="flex items-center gap-3 whitespace-nowrap"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 fill-current text-blue-500"
              >
                <path d={app.icon.path} />
              </svg>

              <span className="text-white">
                {app.name}
              </span>

            </div>
          ))}
        </div>
        </div>
    </div>
  )
}
