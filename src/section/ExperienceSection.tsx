import SectionHeader from "@/components/ui/sectionHeader";

const experiences = [
    {
        role:"Software Engineering Student",
        company:"SMKN 1 Kota Pasuruan",
        period: "2025 - present",
        description:"Studying Software Engineering with a focus on web development, programming fundamentals, database management, and software development. Throughout my studies, I have worked on various school and personal projects while developing my skills in both frontend development and UI/UX design.",
        technologies:["Python","HTML","CSS","MySQL","JavaScript"],
    },
    {
        role:"Web Development & Programming",
        company:"SMKN 1 & UBIG",
        period: "2025 - present",
        description:"Learning and applying web development technologies such as HTML, CSS, JavaScript, Next.js, Tailwind CSS, and TypeScript. Also developing a foundation in Python through basic programming concepts, including variables, conditions, loops, functions, and data structures.",
        technologies:["Next.js","Tailwind CSS","TypeScript"],
    },
    {
        role:"UI/UX Design Exploration",
        company:"Personal Projects",
        period: "2025 - present",
        description:"Exploring UI/UX design through various personal projects and digital product concepts. Focused on creating clean interfaces, intuitive user flows, responsive layouts, and consistent visual systems while considering usability and user experience.",
        technologies:["Figma"],
    },
    {
        role:"Programming & Database Development",
        company:"School & Personal Projects",
        period: "2025 - present",
        description:"Learned programming fundamentals and database management through school assignments and application development projects. Gained experience with basic programming logic, CRUD operations, database relationships, and connecting applications with databases.",
        technologies:["JavaScript","MySQL","Supabase","XAMPP","Python"],
    },
    {
        role:"Creative & Media Experience",
        company:"School Activities & Organization",
        period: "2025 - present",
        description:"Participated in creative and digital media activities involving graphic design, visual communication, content creation, and digital projects. These experiences helped develop creativity, teamwork, communication, and problem-solving skills alongside technical abilities.",
        technologies:["Canva","Figma"],
    },
]

export default function ExperienceSection() {
  return (
    <section id="experience" className="py-32 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10"/>
        <div className="container mx-auto px-6 relative z-10">
            <SectionHeader
                title="Experience that"
                highlight="speaks volume"
                badge="Experience"
                description="Exploring my journey as a developer, from learning the fundamentals to building full-stack applications"
            />

            <div className="relative mt-14">
                <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 
                bg-linear-to-b from-primary/70 via-primary/30 to-transparent md:-translate-x-1/2 shadow-[0_0_25px_rgba(32,178,166,0.8)]" />
                <div className="space-y-12">
                    {experiences.map((exp, index) => (
                        <div 
                            data-aos="flip-right" 
                            data-aos-anchor-placement="top-center" 
                            key={index} 
                            className="relative grid md:grid-cols-2 gap-8">
                            <div 
                            className="absolute left-0 md:left-1/2 top-0 w-3
                            h-3 bg-primary rounded-full -translate-x-1/2 ring-4 ring-background z-10">
                                <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                            </div>
                            {/* content */}
                            <div className={`pl-8 md:pl-0 ${index % 2 === 0 ? "md:pr-16 md:text-right" : "md:col-start-2 md:pl-16"}`}>
                                <div className="p-6 rounded-2xl border border-primary/30 hover:border-primary/50
                                transition-all duration-500">
                                    {/* <span className="text-primary text-sm font-medium">
                                        {exp.period}
                                    </span> */}
                                    <h3 className="text-primary text-xl font-semibold mt-2">
                                        {exp.role}
                                    </h3>
                                    <p className="text-gray-500">
                                        {exp.company}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-4">
                                        {exp.description}
                                    </p>
                                    <div className={`flex flex-wrap gap-2 mt-4 ${index % 2 === 0
                                      ? "md:justify-end" : ""}`}>
                                        {exp.technologies.map((tech,techIndex) => (
                                        <span key={techIndex}
                                    className="px-3 py-1 bg-surface text-xs rounded-full text-gray-300">
                                        {tech}
                                    </span>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    </section>
  )
}
