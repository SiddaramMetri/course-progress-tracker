"use client";

import { Progress } from "@/components/ui/progress";

interface CourseProgressProps {
  completed: number;
  total: number;
  showLabel?: boolean;
  size?: "sm" | "default";
}

export function CourseProgress({
  completed,
  total,
  showLabel = true,
  size = "default",
}: CourseProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <Progress
        value={percentage}
        className={size === "sm" ? "h-2" : "h-3"}
      />
      {showLabel && (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {completed}/{total} ({percentage}%)
        </span>
      )}
    </div>
  );
}
