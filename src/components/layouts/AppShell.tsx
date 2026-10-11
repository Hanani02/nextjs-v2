"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/navbar";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const isAuthOrAdmin =
    pathname?.toLowerCase().startsWith("/login") ||
    pathname?.toLowerCase().startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthOrAdmin && <Navbar />}
      <div className="flex-1">{children}</div>
    </div>
  );
}
