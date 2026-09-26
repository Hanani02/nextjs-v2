"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import SplashScreen from "@/components/SplashScreen/page";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [isSplashFinished, setIsSplashFinished] = useState<boolean | null>(null);
  const pathname = usePathname();

  const isAuthOrAdmin =
    pathname?.toLowerCase().startsWith("/login") ||
    pathname?.toLowerCase().startsWith("/admin");

  useEffect(() => {
    if (isAuthOrAdmin) {
      setIsSplashFinished(true);
    } else {
      setIsSplashFinished(sessionStorage.getItem("splash-finished") === "true");
    }
  }, [isAuthOrAdmin]);

  const finishSplash = () => {
    sessionStorage.setItem("splash-finished", "true");
    setIsSplashFinished(true);
  };

  if (isSplashFinished === null) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isSplashFinished && !isAuthOrAdmin && (
        <SplashScreen onFinish={finishSplash} />
      )}
      {(isSplashFinished || isAuthOrAdmin) && (
        <>
          {!isAuthOrAdmin && <Navbar />}
          <div className="flex-1">{children}</div>
        </>
      )}
    </div>
  );
}
