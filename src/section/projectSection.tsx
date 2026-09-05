import SectionHeader from "@/components/ui/sectionHeader";
import ProjectCard from "@/components/project/ProjectCard"

const projects = [
    {
        title:"Aurora Borealis-Official Band Website",
        description:"This website was created to support the growth and development of Aurora Borealis Band. It was built using HTML and enhanced with Tailwind CSS to create a modern and responsive design. The project includes detailed information about the band, as well as contact information for its members.",
        image:"/image/auroraweb.png",
        tags:["HTML","Tailwind","CSS"],
        liveUrl:"https://hanani02.github.io/web/",
        githubUrl:"https://github.com/Hanani02/Aurora-Borealis-Band-Website"
    },
    {
        title:"Internship Management System — UBIG SIMMAS",
        description:"A web-based internship management system developed to help schools manage student internship activities efficiently. The system provides features for student registration, internship placement, company data management, teacher supervision, and internship monitoring in one centralized platform.",
        image:"/image/simmas.png",
        tags:["Next.js","TypeScript","Prisma"],
        liveUrl:"https://manajemen-magang-iota.vercel.app/",
        githubUrl:"https://github.com/Hanani02/manajemen-magang"
    },
    {
        title:"Basic Next.js — UBIG",
        description:"A basic web project developed using Next.js to explore modern web development concepts. This project focuses on building a clean and responsive user interface while implementing fundamental features and components using Next.js and Tailwind CSS.",
        image:"/image/myapp.png",
        tags:["Next.js","TypeScript","Prisma"],
        liveUrl:"https://tutorial-next-js-ten.vercel.app/",
        githubUrl:"https://github.com/Hanani02/tutorial-next.js"
    },
    {
        title:"StudyLine — Learning Platform UI/UX Design",
        description:"A UI/UX design concept for a modern learning platform designed to make studying more engaging and organized. StudyLine features a clean interface with learning materials, progress tracking, challenges, and interactive elements to help users stay motivated throughout their learning journey. The entire interface was designed in Figma with a focus on usability, visual consistency, and user experience.",
        image:"/image/studyline.png",
        tags:["UI/UX","Figma","Design"],
        liveUrl:"https://www.figma.com/design/0s8vgWdBYIKpXFmBOTECZw/StudyLine?node-id=0-1&t=BLExElDCGe2lfijS-1",
        githubUrl:""
    },
    {
        title:"Restly — Sleep & Alarm App UI/UX Design",
        description:"A UI/UX design concept for a sleep and alarm application focused on helping users build healthier sleep routines. Restly combines alarm scheduling, sleep tracking, sleep history, statistics, and streak-based features in a simple and friendly interface. The design was created in Figma with a focus on intuitive navigation, clear information presentation, and a calming visual experience.",
        image:"/image/restly.png",
        tags:["UI/UX","Figma","Design"],
        liveUrl:"https://www.figma.com/design/080JENlHvEK37sIFpZBaFx/Restly?node-id=2-3&t=BLExElDCGe2lfijS-1",
        githubUrl:""
    }
]

export default function projectSection() {
  return (
    <section id="projects" className="py-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10"/>
    <div className="w-[90%] max-w-6xl mx-auto space-y-12">
        <SectionHeader
        title="some of my recent"
        highlight="work"
        badge="Projects"
        description="A selection of projects showcasing my ability to design, build, and scale modern fullstack applications"
    />

    <div className="grid grid-cols1 md:grid-cols-2 gap-8 lg:gap-10">
        {projects.map((project, index) => (
            <div 
                key={index} 
                data-aos="fade-right" 
                data-aos-delay={index * 100} 
                data-aos-anchor-placement="top-center"
            >
                <ProjectCard {...project}  />
            </div>
        ))}
    </div>
    </div>
    </section>
  )
}
