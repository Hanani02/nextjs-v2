import type { Metadata } from "next";
import { Poppins, Noto_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/navbar";
import { cn } from "@/lib/utils";

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

const poppins = Poppins({
  variable:"--font-poppins",
  subsets:["latin"],
  weight:["300","400","500","600","700","800"]
})

export const metadata: Metadata = {
  title: "NextDev",
  description: "NextDev Portofolio",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        
        {children}
        </body>
    </html>
  );
}
