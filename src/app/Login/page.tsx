export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import LoginForm from "@/app/Login/LoginForm";

interface LoginPageProps {
  searchParams: Promise<{
    door?: string;
  }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const { door } = await searchParams;

  // Ambil dari env Vercel / server, dengan default 'kanagara-admin' jika env belum diisi di Vercel
  const loginDoorPass = (process.env.LOGIN_DOORPASS || 'kanagara-admin').trim();

  // Tidak ada Door Pass
  if (!door) {
    notFound();
  }

  // Verifikasi kecocokan Door Pass (aman terhadap spasi)
  if (door.trim() !== loginDoorPass) {
    notFound();
  }

  // Door Pass benar
  return <LoginForm />;
}