"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import FloatingGameButton from "@/components/game/FloatingGameButton";
import SplashScreen from "@/components/SplashScreen/SplashScreen";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const isAuthOrAdmin =
    pathname?.toLowerCase().startsWith("/login") ||
    pathname?.toLowerCase().startsWith("/admin");

  const isGamePage = pathname?.toLowerCase().startsWith("/game");

  return (
    <>
      {/* Interactive Splash Screen: Completely isolated, hydration-safe, session persistent */}
      {!isAuthOrAdmin && <SplashScreen />}

      {/* Main Portfolio Layout */}
      <div className="flex min-h-screen flex-col">
        {!isAuthOrAdmin && !isGamePage && <Navbar />}
        <main className="flex-1">{children}</main>
        {!isAuthOrAdmin && !isGamePage && <FloatingGameButton />}
      </div>
    </>
  );
}
