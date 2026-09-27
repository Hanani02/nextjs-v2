import { notFound } from "next/navigation";
import  LoginForm  from "@/app/Login/LoginForm"

interface LoginPageProps {
  searchParams: Promise<{
    door?: string;
  }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const { door } = await searchParams;

  const loginDoorPass = process.env.LOGIN_DOORPASS

  // Tidak ada Door Pass
  if (!door) {
    notFound();
  }

  // Door Pass salah
  if (door !== loginDoorPass) {
    notFound();
  }

  // Door Pass benar
  return <LoginForm />;
}