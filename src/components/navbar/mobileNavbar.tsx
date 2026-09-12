import { navLinks } from "./navbar";
import Link from "next/link";
import { Icon } from "@iconify/react";

const navIcons = {
  Home: "akar-icons:home-alt1",
  About: "akar-icons:person",
  Projects: "akar-icons:folder",
  Experience : "lucide:chart-no-axes-combined",
  Contact: "akar-icons:envelope",
};

interface MobileNavProps {
    navOpen:boolean
}

export default function mobileNavbar({navOpen}:MobileNavProps) {
  return (
    <>
    {/* overlay */}
    <div data-mobile-navbar className={`fixed inset-0 z-40 lg:hidden bg-background/70
        backdrop-blur-sm transition-all duration-500 
        ${navOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} />

        <aside data-mobile-navbar className={`fixed top-0 right-0 z-50 h-full
            w-[80%] sm:w-[60%]
            lg:hidden
            bg-surface/95 backdrop-blur-md
            border border-border
            flex flex-col items-center justify-center
            space-y-2 px-6
            transition-all duration-500 ${navOpen ? "translete-x-0" :
            "translate-x-full"}`}>
                <ul>
                    {navLinks.map((link,index) => (
                        <li key={index}>
                            <Link href={link.href} className="w-full text-center
                            flex items-center
                            gap-5
                            py-4 px-6 rounded-lg
                            text-lg font-medium
                            text-text
                            
                            border border-transparent
                            transition-all duration-300
                            
                            hover:bg-primary/10
                            hover:text-primary
                            hover:border-border">
                            <Icon icon={navIcons[link.label as keyof typeof navIcons]} width="22" height="22"/>
                            {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
        </aside>
    </>
  )
}
