"use client";

import {
  BookOpen,
  Check,
  Clock,
  GraduationCap,
  Layers,
  Lock,
  Play,
  Star,
} from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface PublicLesson {
  id: string;
  title: string;
  sort_order: number;
  duration_minutes: number | null;
}

interface PublicModule {
  title: string;
  sort_order: number;
  lessons: PublicLesson[];
}

interface PublicCourseDetail {
  id: string;
  title: string;
  description: string | null;
  is_free: boolean;
  total_lessons: number;
  total_modules: number;
  modules: PublicModule[];
}

export default function ExploreCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { isAuthenticated, isAdmin } = useAuth();

  const { data: course, isLoading } = useQuery({
    queryKey: ["public-course", courseId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/courses/${courseId}`);
      if (!res.ok) throw new Error("Not found");
      return res.json() as Promise<PublicCourseDetail>;
    },
  });

  // Check if authenticated user has access to this course
  const { data: hasAccess } = useQuery({
    queryKey: ["course-access", courseId],
    queryFn: async () => {
      try {
        await apiFetch(`/courses/${courseId}`);
        return true;
      } catch {
        return false;
      }
    },
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  const handleRequestAccess = async () => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/explore/${courseId}`;
      return;
    }
    try {
      await apiFetch("/public/access-requests", {
        method: "POST",
        body: JSON.stringify({ course_id: courseId }),
      });
      toast.success("Access request submitted! Admin will review it.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit request"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto max-w-6xl flex h-14 items-center px-6">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">BatchLearn</span>
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-6 py-12">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Course not found.</p>
      </div>
    );
  }

  const totalDuration = course.modules.reduce(
    (sum, m) =>
      sum + m.lessons.reduce((s, l) => s + (l.duration_minutes || 0), 0),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">BatchLearn</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/#courses">
              <Button variant="ghost" size="sm">Courses</Button>
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-10 pb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            {course.is_free ? (
              <Badge className="mb-3 bg-blue-600">FREE</Badge>
            ) : (
              <Badge variant="secondary" className="mb-3">
                <Star className="h-3 w-3 mr-1" /> Premium
              </Badge>
            )}

            <h1 className="text-3xl font-bold tracking-tight mb-3">
              {course.title}
            </h1>

            {course.description && (
              <p className="text-muted-foreground leading-relaxed mb-6">
                {course.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                <span>
                  <strong className="text-foreground">{course.total_modules}</strong> Modules
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>
                  <strong className="text-foreground">{course.total_lessons}</strong> Lessons
                </span>
              </div>
              {totalDuration > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>
                    <strong className="text-foreground">
                      {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                    </strong>{" "}
                    Duration
                  </span>
                </div>
              )}
            </div>

            {/* CTA */}
            {isAuthenticated ? (
              hasAccess ? (
                <Link href={`/courses/${course.id}`}>
                  <Button size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    {course.is_free ? "Start Learning" : "Continue Learning"}
                  </Button>
                </Link>
              ) : course.is_free ? (
                <Link href={`/courses/${course.id}`}>
                  <Button size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    Start Learning
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Button size="lg" onClick={handleRequestAccess}>
                    <Lock className="h-4 w-4 mr-2" />
                    Request Access
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Admin will review and grant access.
                  </p>
                </div>
              )
            ) : (
              <Link href={`/login?redirect=/explore/${course.id}`}>
                <Button size="lg">
                  Sign in to Enroll
                </Button>
              </Link>
            )}
          </div>

          {/* Cover placeholder */}
          <div className="w-full md:w-72 h-48 md:h-auto rounded-xl border bg-gradient-to-br from-primary/10 to-muted flex items-center justify-center shrink-0">
            <BookOpen className="h-16 w-16 text-primary/20" />
          </div>
        </div>
      </section>

      <Separator />

      {/* Curriculum */}
      <section className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="text-xl font-bold mb-6">Curriculum</h2>

        <Accordion
          multiple
          defaultValue={course.modules.map((_, i) => `mod-${i}`)}
          className="w-full"
        >
          {course.modules.map((module, i) => (
            <AccordionItem key={i} value={`mod-${i}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs text-muted-foreground">
                    Module {i + 1}
                  </span>
                  <span className="font-medium">{module.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between px-3 py-2 rounded-md text-sm"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {course.is_free ? (
                          <Play className="h-3.5 w-3.5" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-orange-400" />
                        )}
                        <span>{lesson.title}</span>
                      </div>
                      {lesson.duration_minutes && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.duration_minutes}m
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Bottom CTA */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-10 text-center">
          <h2 className="text-xl font-bold mb-2">Ready to start?</h2>
          <p className="text-muted-foreground mb-4">
            {course.is_free
              ? "This course is free. Create an account and start learning."
              : "Request access to unlock this premium course."}
          </p>
          {!isAuthenticated && (
            <Link href="/register">
              <Button size="lg">Create Free Account</Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            BatchLearn
          </div>
          <Link href="/" className="hover:underline">Back to home</Link>
        </div>
      </footer>
    </div>
  );
}
