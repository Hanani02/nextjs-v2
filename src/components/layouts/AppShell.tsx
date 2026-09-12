"use client";

import { useState } from "react";
import Navbar from "@/components/navbar/navbar";
import SplashScreen from "@/components/SplashScreen/page";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  return (
    <>
      {!isSplashFinished && (
        <SplashScreen onFinish={() => setIsSplashFinished(true)} />
      )}
      {isSplashFinished && (
        <>
          <Navbar />
          {children}
        </>
      )}
    </>
  );
}
