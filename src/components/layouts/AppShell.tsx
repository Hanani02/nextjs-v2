"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import FloatingGameButton from "@/components/game/FloatingGameButton";

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
    <div className="flex min-h-screen flex-col">
      {!isAuthOrAdmin && !isGamePage && <Navbar />}
      <div className="flex-1">{children}</div>
      {!isAuthOrAdmin && !isGamePage && <FloatingGameButton />}
    </div>
  );
}

