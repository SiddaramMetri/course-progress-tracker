"use client";

import { Progress } from "@/components/ui/progress";

interface ModuleProgressProps {
  completed: number;
  total: number;
}

export function ModuleProgress({ completed, total }: ModuleProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2 w-full">
      <Progress value={percentage} className="h-1.5 flex-1" />
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {completed}/{total}
      </span>
    </div>
  );
}
