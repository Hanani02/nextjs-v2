"use client";

import { useTheme } from "@/context/ThemeContext";
import LineWaves from "@/components/Hero/background";

export default function HeroBackground() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <>
      {/* Background ambient glow that shifts with theme */}
      <div
        className={`absolute top-1/4 left-1/3 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isLight ? "bg-sky-400/8" : "bg-primary/10"
        }`}
      />

      {/* Main LineWaves with theme-reactive colors and shader uniforms */}
      <div className="inset-0 absolute [mask-image:linear-gradient(to_bottom,black_88%,transparent_100%)]">
        <LineWaves
          speed={0.3}
          innerLineCount={32}
          outerLineCount={36}
          warpIntensity={1}
          rotation={-45}
          edgeFadeWidth={0}
          colorCycleSpeed={1}
          brightness={isLight ? 0.16 : 0.2}
          color1={isLight ? "#93C5FD" : "#0F172A"}
          color2={isLight ? "#A5B4FC" : "#312E81"}
          color3={isLight ? "#7DD3FC" : "#A78BFA"}
          enableMouseInteraction
          mouseInfluence={2}
          lightMode={isLight}
        />
      </div>
    </>
  );
}
