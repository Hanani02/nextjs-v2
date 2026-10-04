"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import SplashScreen from "@/components/SplashScreen/page";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [showSplash, setShowSplash] = useState(false);
  const pathname = usePathname();

  const isAuthOrAdmin =
    pathname?.toLowerCase().startsWith("/login") ||
    pathname?.toLowerCase().startsWith("/admin");

  useEffect(() => {
    if (isAuthOrAdmin) return;

    try {
      const alreadySeen = sessionStorage.getItem("splash-finished") === "true";
      const isBot = /Lighthouse|Googlebot|HeadlessChrome|Chrome-Lighthouse/i.test(
        navigator.userAgent
      );

      if (!alreadySeen && !isBot) {
        setShowSplash(true);
      }
    } catch {
      setShowSplash(false);
    }
  }, [isAuthOrAdmin]);

  const finishSplash = () => {
    try {
      sessionStorage.setItem("splash-finished", "true");
    } catch {
      // ignore
    }
    setShowSplash(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {showSplash && !isAuthOrAdmin && (
        <SplashScreen onFinish={finishSplash} />
      )}
      {!isAuthOrAdmin && !showSplash && <Navbar />}
      <div className="flex-1">{children}</div>
    </div>
  );
}
