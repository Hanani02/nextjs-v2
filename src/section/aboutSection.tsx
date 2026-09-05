import Image from "next/image"
import {LuCode, LuDatabase, LuRocket} from "react-icons/lu"

export default function AboutSection() {
  return (
    <section id="about" className="py-24 overflow-hidden relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10"/>
        <div className="w-[90%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* leftside */}
            <div 
            data-aos="fade-right"data-aos-delay="100"data-aos-anchor-placement="top-center" 
            className="flex justify-center lg:justify-start">
            <div className="relative w-85 h-85 md:w-120 md:h-120 rounded-2xl
            bg-surface/80 backdrop-blur-md
            border border-border
            flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-primary/10
                blur-2xl" />

                <div className="w-[85%] h-[85%] relative">
                    <Image fill src="/image/about.jpeg" alt="About Me"
                    className="z-10 object-cover rounded-xl"/>
                </div>
            </div>
        </div>

        {/* rightside */}
        <div className="space-y-6" data-aos="fade-left"data-aos-delay="100"data-aos-anchor-placement="top-center">
            <span className="text-sm text-primary bg-primary/10 px-4 py-1.5
            rounded-full border border-border inline-block">
                About Me
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-text
            leading-tight">
                I build sclable and user-focused web applications
            </h2>

            <p className="text-gray-400 max-w-xl">
                 I'm a Grade 11 Software Engineering (RPL) student at SMKN 1 Kota Pasuruan, 
                 passionate about building smooth, modern, and user-friendly web applications. 
                 I enjoy turning ideas into functional digital experiences while continuously improving 
                 my development and design skills through school and personal projects.
            </p>
            <p className="text-gray-400 max-w-xl">
                 I frequently work with HTML, CSS, JavaScript, TypeScript, React, Next.js, 
                 and Tailwind CSS, along with MySQL and basic Python. For design and interface development, 
                 I often use Figma and shadcn/ui to create clean, responsive, and consistent experiences.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-surface border border-border text-center">
                    <LuCode className="mx-auto mb-2 text-primary w-6 h-6" />
                    <p className="text-text text-sm">Clean code</p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border text-center">
                    <LuDatabase className="mx-auto mb-2 text-primary w-6 h-6" />
                    <p className="text-text text-sm">Fullstack Apps</p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border text-center">
                    <LuRocket className="mx-auto mb-2 text-primary w-6 h-6" />
                    <p className="text-text text-sm">Performance</p>
                </div>
            </div>
        </div>
        </div>
        
        

        
    </section>
    )
}
