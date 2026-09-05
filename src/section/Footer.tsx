import Logo from "@/components/navbar/logo";
import { LuGithub, LuInstagram } from "react-icons/lu";
import { FaDiscord } from "react-icons/fa6";
import Link from "next/link";


export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-background overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10"/>


    <div className="w-[90%] max-w-6xl mx-auto py-14 space-y-10
    relative z-10">
        {/* top section */}
        <div className="flex flex-col items-center text-center gap-8
        md:flex-row md:items-start md:justify-between md:text-left">
            <div className="space-y-3 max-w-xs">
                <div className="flex justify-center md:justify-start">
                    <Logo/>
                </div>
                <p className="text-sm text-gray-300">
                    Crafting modern, scalble web experiences with clean code and thoughtful design.
                </p>
            </div>

            {/* social */}
            <div className="flex items-center gap-4">
                {[
                    {
                        icon:LuGithub,
                        href:"https://github.com/Hanani02"
                    },
                    {
                        icon:FaDiscord,
                        href:"https://discord.com/users/10737232961153433611"
                    },
                    {
                        icon:LuInstagram,
                        href:"https://www.instagram.com/hanannreal/"
                    }
                ].map(({icon: Icon, href}, index) => (
                    <Link 
                        key={index} 
                        href={href} 
                        target="_blank"
                        className="w-10 h-10
                    rounded-full
                    flex items-center justify-center
                    border border-border
                    text-gray-300
                    hover:text-primary hover:border-primary
                    hover:shadow-[0_0_20px_rgba(32,178,166,0.2)]
                    transition-all duration-300"
                    >
                        <Icon className="w-5 h-5"/>
                    </Link>
                ))}
            </div>
        </div>

        <div className="h-px bg-border" />

        {/* bottom footer */}
        <p className="text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Kanagara Studio.All right reserved
        </p>

        
    </div>
    </footer>
  )
}
