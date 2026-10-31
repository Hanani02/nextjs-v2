"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AnimationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const initAOS = async () => {
      await import("aos");
      AOS.init({
        duration: 900,
        easing: "ease-out",
        once: true,
        anchorPlacement: "top-bottom",
        offset: 50,
      });

      // Recalculate AOS positions after initial DOM layout settlements
      setTimeout(() => {
        AOS.refresh();
      }, 400);
      setTimeout(() => {
        AOS.refresh();
      }, 1200);
    };

    initAOS();
  }, []);

  return <>{children}</>;
}
