"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar";
import SplashScreen from "@/components/SplashScreen/page";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [isSplashFinished, setIsSplashFinished] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSplashFinished(sessionStorage.getItem("splash-finished") === "true");
  }, []);

  const finishSplash = () => {
    sessionStorage.setItem("splash-finished", "true");
    setIsSplashFinished(true);
  };

  if (isSplashFinished === null) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isSplashFinished && (
        <SplashScreen onFinish={finishSplash} />
      )}
      {isSplashFinished && (
        <>
          <Navbar />
          <div className="flex-1">{children}</div>
        </>
      )}
    </div>
  );
}
