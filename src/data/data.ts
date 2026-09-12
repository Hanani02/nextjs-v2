export const projects = [
    {
      slug:"aurora",
        title:"Aurora Borealis-Official Band Website",
        description:"This website was created to support the growth and development of Aurora Borealis Band. It was built using HTML and enhanced with Tailwind CSS to create a modern and responsive design. The project includes detailed information about the band, as well as contact information for its members.",
        image:"/image/auroraweb.png",
        tags:["HTML","Tailwind","CSS"],
        kategori : "web",
        liveUrl:"https://hanani02.github.io/web/",
        githubUrl:"https://github.com/Hanani02/Aurora-Borealis-Band-Website"
    },
    {
      slug:"simmas",
        title:"Internship Management System — UBIG SIMMAS",
        description:"A web-based internship management system developed to help schools manage student internship activities efficiently. The system provides features for student registration, internship placement, company data management, teacher supervision, and internship monitoring in one centralized platform.",
        image:"/image/simmas.png",
        tags:["Next.js","TypeScript","Prisma"],
        kategori: "web",
        liveUrl:"https://manajemen-magang-iota.vercel.app/",
        githubUrl:"https://github.com/Hanani02/manajemen-magang"
    },
    {
      slug:"basicnextjs",
        title:"Basic Next.js — UBIG",
        description:"A basic web project developed using Next.js to explore modern web development concepts. This project focuses on building a clean and responsive user interface while implementing fundamental features and components using Next.js and Tailwind CSS.",
        image:"/image/myapp.png",
        tags:["Next.js","TypeScript","Prisma"],
        kategori: "web",
        liveUrl:"https://tutorial-next-js-ten.vercel.app/",
        githubUrl:"https://github.com/Hanani02/tutorial-next.js"
    },
    {
      slug:"studyline",
        title:"StudyLine — Learning Platform UI/UX Design",
        description:"A UI/UX design concept for a modern learning platform designed to make studying more engaging and organized. StudyLine features a clean interface with learning materials, progress tracking, challenges, and interactive elements to help users stay motivated throughout their learning journey. The entire interface was designed in Figma with a focus on usability, visual consistency, and user experience.",
        image:"/image/studyline.png",
        tags:["UI/UX","Figma","Design"],
        kategori: "UI/UX",
        liveUrl:"https://www.figma.com/design/0s8vgWdBYIKpXFmBOTECZw/StudyLine?node-id=0-1&t=BLExElDCGe2lfijS-1",
        githubUrl:""
    },
    {
      slug:"restly",
        title:"Restly — Sleep & Alarm App UI/UX Design",
        description:"A UI/UX design concept for a sleep and alarm application focused on helping users build healthier sleep routines. Restly combines alarm scheduling, sleep tracking, sleep history, statistics, and streak-based features in a simple and friendly interface. The design was created in Figma with a focus on intuitive navigation, clear information presentation, and a calming visual experience.",
        image:"/image/restly.png",
        tags:["UI/UX","Figma","Design"],
        kategori: "UI/UX",
        liveUrl:"https://www.figma.com/design/080JENlHvEK37sIFpZBaFx/Restly?node-id=2-3&t=BLExElDCGe2lfijS-1",
        githubUrl:""
    }
]

export const experiences = [
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

export const detailProyek = {
  simmas: {
    deskripsi:
      "SIMMAS adalah sistem yang dibuat untuk membantu pengelolaan kegiatan magang siswa.",

    role:"Fullstack Developer",

    fitur: [
      "Authentication",
      "Dashboard Admin",
      "Manajemen Siswa",
      "Manajemen Guru",
      "Logbook",
    ],

    teknologi: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "Prisma",
      "Tailwind CSS",
    ],

  },

  aurora: {
    deskripsi:
      "Aurora Borealis Official merupakan website untuk memperkenalkan profil dan informasi sebuah band.",

    role:"Fullstack Developer",

    fitur: [
      "Band Profile",
      "Gallery",
      "Contact",
    ],

    teknologi: [
      "HTML",
      "Tailwind CSS",
      "JavaScript",
    ],
  },
  basicnextjs: {
    deskripsi:
      "Sebuah Website yang dimana menggunakan design Tailwind basic dan sentuhan CSS yang modern.",

    role:"Fullstack Developer",

    fitur: [
      "QR User",
      "Penanganan Map",
      "Input Sebuah Data",
      "Analytic Dashboard",
        "Spirte Image",
        "Image Project"
    ],

    teknologi: [
      "HTML",
      "Tailwind CSS",
      "JavaScript",
    ],
  },
  studyline: {
    deskripsi:
      "Proyek design Belajar berjudul StudyLine dimana menciptakan platform belajar online dengan banyak fitur serta dapat belajar bersama user lain",

    role:"Designer UI/UX",

    fitur: [
      "Friend List",
      "AI Assistant",
      "Statistic User"
    ],

    teknologi: [
      "Figma",
      "UI/UX"
    ],
  },
};