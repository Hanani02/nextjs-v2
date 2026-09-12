import  Link  from "next/link";
import Image from "next/image";
import { LuExternalLink, LuEye, LuGithub } from "react-icons/lu";
import LinkButton from "../ui/LinkButton";
interface ProjectCardProps {
    slug:string,
    title:string,
    description:string,
    liveUrl?:string,
    githubUrl?:string,
    image:string,
    tags:string[]
}

export default function ProjectCard({
    slug,
    title,
    description,
    liveUrl,
    githubUrl,
    image,
    tags
}:ProjectCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl
        bg-surface border border-border
        transition-all duration-300
        hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
            {/* image */}
            <div className="relative h-60 md:h-64 overflow-hidden">
                <Image src={image} alt={title} fill className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />

                <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition"></div>
            </div>

            {/* contact */}
            <div className="p-6 space-y-5">
                <h3 className="text-xl font-semibold text-text group-hover:text-primary
                transition">
                    {title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed">
                    {description}
                </p>

                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <span key={tag} 
                        className="text-xs px-2.5 py-1 rounded-md
                        bg-primary/10 text-primary border border-border">
                            {tag}
                        </span>
                    ))}
                </div>
                {/* Links */}
                <div className="flex items-center gap-4 pt-3">
                    {/* Button */}
                <LinkButton
                    text="Detail"
                    href={`/Project/detail?slug=${slug}`}
                    rounded
                    icon={LuEye}
                />
                    {liveUrl && (
                        <Link
                            href={liveUrl}
                            target="_blank"
                            className="flex items-center gap-1 text-sm text-text-muted
                            hover:text-primary transition">
                                <LuExternalLink className="w-4 h-4" />
                                Live
                            </Link>
                    )}
                    {githubUrl && (
                        <Link
                            href={githubUrl}
                            target="_blank"
                            className="flex items-center gap-1 text-sm text-text-muted
                            hover:text-primary transition">
                                <LuGithub className="w-4 h-4" />
                                Github
                            </Link>
                    )}
                </div>
            </div>
    </div>
  )
}
