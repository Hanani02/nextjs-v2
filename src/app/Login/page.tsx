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

  // Baca langsung dari env (tanpa hardcode)
  const loginDoorPass = process.env.LOGIN_DOORPASS?.trim();

  // Tidak ada Door Pass atau env belum diset
  if (!door || !loginDoorPass) {
    notFound();
  }

  // Verifikasi kecocokan Door Pass (aman terhadap spasi)
  if (door.trim() !== loginDoorPass) {
    notFound();
  }

  // Door Pass benar
  return <LoginForm />;
}