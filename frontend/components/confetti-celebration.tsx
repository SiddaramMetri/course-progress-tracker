"use client";

import confetti from "canvas-confetti";
import { PartyPopper, Sparkles, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ConfettiVariant = "classic" | "petals" | "stars";

interface ConfettiCelebrationProps {
  /** Auto-trigger on mount */
  autoTrigger?: boolean;
  /** Animation variant */
  variant?: ConfettiVariant;
  /** Custom colors (hex) */
  colors?: string[];
  /** Intensity: 1-10 */
  intensity?: number;
  /** Course title to display */
  courseTitle?: string;
  /** Show the replay button */
  showReplayButton?: boolean;
  /** Callback when celebration is done */
  onComplete?: () => void;
}

const PRESETS: Record<
  ConfettiVariant,
  { colors: string[]; shapes: confetti.Shape[]; label: string }
> = {
  classic: {
    colors: ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"],
    shapes: ["square", "circle"],
    label: "Classic",
  },
  petals: {
    colors: ["#f472b6", "#fb7185", "#fda4af", "#fecdd3", "#e879f9", "#c084fc"],
    shapes: ["circle"],
    label: "Flower Petals",
  },
  stars: {
    colors: ["#fbbf24", "#f59e0b", "#fcd34d", "#fef3c7", "#ffffff"],
    shapes: ["star", "circle"],
    label: "Stars",
  },
};

function fireConfetti(
  variant: ConfettiVariant,
  customColors?: string[],
  intensity: number = 5
) {
  const preset = PRESETS[variant];
  const colors = customColors ?? preset.colors;
  const particleCount = Math.floor(40 + intensity * 15);
  const spread = 50 + intensity * 8;

  // Burst from left
  confetti({
    particleCount,
    spread,
    origin: { x: 0.1, y: 0.6 },
    colors,
    shapes: preset.shapes,
    gravity: variant === "petals" ? 0.4 : 1,
    drift: variant === "petals" ? 1 : 0,
    ticks: 200,
    scalar: variant === "petals" ? 1.4 : 1,
  });

  // Burst from right
  confetti({
    particleCount,
    spread,
    origin: { x: 0.9, y: 0.6 },
    colors,
    shapes: preset.shapes,
    gravity: variant === "petals" ? 0.4 : 1,
    drift: variant === "petals" ? -1 : 0,
    ticks: 200,
    scalar: variant === "petals" ? 1.4 : 1,
  });

  // Center burst (delayed)
  setTimeout(() => {
    confetti({
      particleCount: Math.floor(particleCount * 1.5),
      spread: spread + 30,
      origin: { x: 0.5, y: 0.4 },
      colors,
      shapes: preset.shapes,
      gravity: variant === "petals" ? 0.3 : 0.8,
      drift: 0,
      ticks: 300,
      scalar: variant === "stars" ? 1.2 : 1,
    });
  }, 300);
}

function fireContinuous(
  variant: ConfettiVariant,
  customColors?: string[],
  intensity: number = 5,
  durationMs: number = 3000
) {
  const end = Date.now() + durationMs;
  const preset = PRESETS[variant];
  const colors = customColors ?? preset.colors;

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: Math.floor(2 + intensity * 0.5),
      angle: 60 + Math.random() * 60,
      spread: 45 + intensity * 5,
      origin: { x: Math.random(), y: Math.random() * 0.4 },
      colors,
      shapes: preset.shapes,
      gravity: variant === "petals" ? 0.3 : 0.8,
      drift: variant === "petals" ? (Math.random() - 0.5) * 2 : 0,
      scalar: variant === "petals" ? 1.5 : variant === "stars" ? 1.3 : 1,
    });

    requestAnimationFrame(frame);
  };

  frame();
}

export function ConfettiCelebration({
  autoTrigger = true,
  variant = "classic",
  colors,
  intensity = 5,
  courseTitle,
  showReplayButton = true,
  onComplete,
}: ConfettiCelebrationProps) {
  const [hasPlayed, setHasPlayed] = useState(false);

  const triggerCelebration = useCallback(() => {
    // Initial big bursts
    fireConfetti(variant, colors, intensity);

    // Continuous shower
    setTimeout(() => {
      fireContinuous(variant, colors, intensity, 2500);
    }, 500);

    setHasPlayed(true);

    // Notify completion
    if (onComplete) {
      setTimeout(onComplete, 4000);
    }
  }, [variant, colors, intensity, onComplete]);

  useEffect(() => {
    if (autoTrigger && !hasPlayed) {
      // Small delay for component to mount
      const timer = setTimeout(triggerCelebration, 300);
      return () => clearTimeout(timer);
    }
  }, [autoTrigger, hasPlayed, triggerCelebration]);

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <Trophy className="h-8 w-8 text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Course Completed!
        </h2>
        {courseTitle && (
          <p className="text-muted-foreground mt-1">{courseTitle}</p>
        )}
      </div>

      <Badge className="bg-green-600 text-sm px-3 py-1">
        <Sparkles className="h-3.5 w-3.5 mr-1" />
        Achievement Unlocked
      </Badge>

      {showReplayButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={triggerCelebration}
          className="mt-2"
        >
          <PartyPopper className="h-4 w-4 mr-1" />
          Celebrate Again
        </Button>
      )}
    </div>
  );
}

/**
 * Standalone function to fire confetti anywhere in the app.
 * Usage: import { fireConfettiBurst } from "@/components/confetti-celebration";
 *        fireConfettiBurst(); // or fireConfettiBurst("petals");
 */
export function fireConfettiBurst(
  variant: ConfettiVariant = "classic",
  customColors?: string[],
  intensity: number = 5
) {
  fireConfetti(variant, customColors, intensity);
  setTimeout(() => {
    fireContinuous(variant, customColors, intensity, 2000);
  }, 400);
}
