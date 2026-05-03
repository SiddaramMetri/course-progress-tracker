"use client";

import { BookOpen } from "lucide-react";

interface GradientCoverProps {
  /** Height class: h-40, h-44, h-48, etc. */
  height?: string;
  /** Icon size class */
  iconSize?: string;
  /** Color theme */
  variant?: "primary" | "violet" | "blue" | "green" | "amber";
  /** Show the book icon */
  showIcon?: boolean;
  /** Additional content (badges, overlays) */
  children?: React.ReactNode;
  /** Additional classes */
  className?: string;
}

const VARIANTS = {
  primary: {
    bg: "from-primary/[0.12] via-primary/[0.04] to-muted",
    orb1: "bg-primary/[0.15]",
    orb2: "bg-violet-500/[0.12]",
    orb3: "bg-blue-400/[0.08]",
    icon: "text-primary/20",
  },
  violet: {
    bg: "from-violet-500/[0.12] via-violet-500/[0.04] to-muted",
    orb1: "bg-violet-500/[0.15]",
    orb2: "bg-purple-500/[0.12]",
    orb3: "bg-indigo-400/[0.08]",
    icon: "text-violet-500/20",
  },
  blue: {
    bg: "from-blue-500/[0.12] via-blue-500/[0.04] to-muted",
    orb1: "bg-blue-500/[0.15]",
    orb2: "bg-cyan-500/[0.12]",
    orb3: "bg-sky-400/[0.08]",
    icon: "text-blue-500/20",
  },
  green: {
    bg: "from-green-500/[0.12] via-green-500/[0.04] to-muted",
    orb1: "bg-green-500/[0.15]",
    orb2: "bg-emerald-500/[0.12]",
    orb3: "bg-teal-400/[0.08]",
    icon: "text-green-500/20",
  },
  amber: {
    bg: "from-amber-500/[0.12] via-amber-500/[0.04] to-muted",
    orb1: "bg-amber-500/[0.15]",
    orb2: "bg-orange-500/[0.12]",
    orb3: "bg-yellow-400/[0.08]",
    icon: "text-amber-500/20",
  },
};

/**
 * Reusable gradient cover with decorative orbs.
 * Used for course cards, explore page, and anywhere a visual placeholder is needed.
 */
export function GradientCover({
  height = "h-40",
  iconSize = "h-12 w-12",
  variant = "primary",
  showIcon = true,
  children,
  className = "",
}: GradientCoverProps) {
  const v = VARIANTS[variant];

  return (
    <div
      className={`relative ${height} bg-gradient-to-br ${v.bg} overflow-hidden flex items-center justify-center ${className}`}
    >
      {/* Orb top-right */}
      <div
        className={`absolute -top-6 -right-6 w-28 h-28 ${v.orb1} rounded-full blur-2xl`}
      />
      {/* Orb bottom-left */}
      <div
        className={`absolute -bottom-8 -left-8 w-24 h-24 ${v.orb2} rounded-full blur-2xl`}
      />
      {/* Orb center */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 ${v.orb3} rounded-full blur-3xl`}
      />
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />

      {/* Icon */}
      {showIcon && (
        <BookOpen
          className={`${iconSize} ${v.icon} relative z-10 group-hover:scale-110 transition-transform duration-500`}
        />
      )}

      {/* Children (badges, overlays) */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}
