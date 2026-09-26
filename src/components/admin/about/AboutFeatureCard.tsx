import type { ReactNode } from 'react';

interface AboutFeatureCardProps {
  icon: ReactNode;
  title: string;
}

export default function AboutFeatureCard({
  icon,
  title,
}: AboutFeatureCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-center">
      <div className="mx-auto mb-1 flex h-5 w-5 items-center justify-center text-primary">
        {icon}
      </div>

      <p className="text-xs font-medium text-text">
        {title}
      </p>
    </div>
  );
}