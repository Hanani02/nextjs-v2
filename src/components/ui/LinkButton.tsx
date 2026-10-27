import Link from "next/link";
import { IconType } from "react-icons";
import { smoothScrollToSection } from "@/lib/smoothScroll";

interface LinkButtonProps {
    href: string;
    text: string;
    icon?: IconType;
    iconPosition?: "Left" | "Right";
    rounded?: boolean;
    download?: boolean;
    variant?: "primary" | "outline";
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    scroll?: boolean;
}

export default function LinkButton({
    href,
    text,
    icon: Icon,
    iconPosition = "Right",
    rounded,
    download = false,
    variant = "primary",
    onClick,
    scroll = false,
}: LinkButtonProps) {
    const baseStyles = `
    relative px-6 py-3
    font-medium ${rounded ? "rounded-full" : "rounded-lg"}
    inline-flex items-center justify-center gap-2
    overflow-hidden text-text
    border
    transition-all duration-300
    hover:scale-[1.02]
    active:scale-[0.98]
    cursor-pointer
    `;

    const variants = {
        primary: `bg-primary text-white border-none shadow-md shadow-primary/20 hover:opacity-95`,
        outline: `bg-transparent text-text border-border hover:text-primary hover:border-primary hover:bg-primary/10`,
    };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (onClick) onClick(e);
        if (
            href.startsWith("#") ||
            (href.startsWith("/#") &&
                typeof window !== "undefined" &&
                (window.location.pathname === "/" || window.location.pathname === ""))
        ) {
            e.preventDefault();
            const targetId = href.split("#")[1];
            if (targetId) {
                smoothScrollToSection(targetId, {
                    onComplete: () => {
                        window.history.replaceState(null, "", href);
                    },
                });
            }
        }
    };

    return (
        <Link
            download={download}
            className={`${baseStyles} ${variants[variant]}`}
            href={href}
            onClick={handleClick}
            scroll={scroll}
        >
            {Icon && iconPosition === "Left" && <Icon className="w-5 h-5 z-10" />}
            <span className="z-10">{text}</span>
            {Icon && iconPosition === "Right" && <Icon className="w-5 h-5 z-10" />}
        </Link>
    );
}
