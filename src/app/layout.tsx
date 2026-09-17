import type { Metadata } from "next";
import { Poppins, Noto_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layouts/AppShell";

const playfairDisplayHeading = Playfair_Display({ subsets: ["latin"], variable: "--font-heading" });

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

const poppins = Poppins({
  variable:"--font-poppins",
  subsets:["latin"],
  weight:["300","400","500","600","700","800"]
})

export const metadata: Metadata = {
  title: "Kanagara Studio",
  description: "Portofolio Hanan",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.className} h-full antialiased`}>
      <body className="min-h-screen bg-background text-text">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
