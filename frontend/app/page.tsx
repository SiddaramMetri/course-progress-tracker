"use client";

import {
  BookOpen,
  GraduationCap,
  Layers,
  Search,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface PublicCourse {
  id: string;
  title: string;
  description: string | null;
  is_free: boolean;
  total_lessons: number;
  total_modules: number;
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const url = q
        ? `${API_BASE}/public/courses?search=${encodeURIComponent(q)}`
        : `${API_BASE}/public/courses`;
      const res = await fetch(url);
      if (res.ok) setCourses(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses("");
  }, [fetchCourses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses(search);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">
              Course Tracker
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <Badge variant="secondary" className="mb-4">
          <Zap className="h-3 w-3 mr-1" />
          Learn at your own pace
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Master New Skills with
          <br />
          <span className="text-primary">Interactive Courses</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Access expert-led courses in programming, web development, data
          science, and more. Track your progress and learn with structured
          video lessons.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/register">
            <Button size="lg">
              Start Learning Free
            </Button>
          </Link>
          <a href="#courses">
            <Button variant="outline" size="lg">
              Browse Courses
            </Button>
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold">{courses.length}+</p>
            <p className="text-sm text-muted-foreground mt-1">Courses Available</p>
          </div>
          <div>
            <p className="text-3xl font-bold">
              {courses.reduce((s, c) => s + c.total_lessons, 0)}+
            </p>
            <p className="text-sm text-muted-foreground mt-1">Video Lessons</p>
          </div>
          <div>
            <p className="text-3xl font-bold">
              {courses.filter((c) => c.is_free).length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Free Courses</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">
          Why Learn With Us?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: BookOpen,
              title: "Structured Learning",
              desc: "Courses organized into modules with step-by-step video lessons and rich content.",
            },
            {
              icon: Layers,
              title: "Track Progress",
              desc: "Mark lessons complete, see your progress per module and course with visual indicators.",
            },
            {
              icon: Users,
              title: "Batch System",
              desc: "Join a batch and access scheduled content. Modules unlock weekly so you stay on track.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Course Catalog */}
      <section id="courses" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Explore Courses</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Find the right course for your learning goals.
            </p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="pl-9 w-64"
              />
            </div>
            <Button type="submit" variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border overflow-hidden animate-pulse"
              >
                <div className="h-40 bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {search ? "No courses match your search." : "No courses yet."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="rounded-xl border overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Cover */}
                <div className="relative h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-muted flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary/30 group-hover:scale-110 transition-transform" />
                  {course.is_free ? (
                    <Badge className="absolute top-3 right-3 bg-blue-600">
                      FREE
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="absolute top-3 right-3"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>
                      {course.total_modules} modules &middot;{" "}
                      {course.total_lessons} lessons
                    </span>
                  </div>
                  <Link href={`/explore/${course.id}`}>
                    <Button size="sm" className="w-full">
                      View Course
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Start Learning?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Create a free account and get instant access to free courses.
            Join a batch for structured, guided learning.
          </p>
          <Link href="/register">
            <Button size="lg">Create Free Account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Course Tracker
          </div>
          <p>Built with Next.js, FastAPI & PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
}
