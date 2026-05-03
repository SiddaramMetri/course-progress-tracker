"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Heart,
  Layers,
  Lock,
  Play,
  Search,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { GradientCover } from "@/components/gradient-cover";
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
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

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
    // Health check
    fetch(`${API_BASE}/health`)
      .then((r) => setApiHealthy(r.ok))
      .catch(() => setApiHealthy(false));
  }, [fetchCourses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses(search);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-110">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              BatchLearn
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <a href="#features">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Features
              </Button>
            </a>
            <a href="#courses">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Courses
              </Button>
            </a>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm">
                  Dashboard
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Grid background like shadcn */}
        <div className="absolute inset-0 -z-10">
          {/* Grid pattern - using CSS class for reliability */}
          <div className="absolute inset-0 hero-grid" />
          {/* Radial mask to fade grid at edges */}
          <div className="absolute inset-0 hero-grid-mask" />
          {/* Gradient orbs for color */}
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/[0.07] rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-violet-500/[0.07] rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur px-4 py-1.5 text-sm mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Batch-based learning platform</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              New
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Learn Skills That
            <br />
            <span className="bg-gradient-to-r from-primary via-violet-500 to-blue-500 bg-clip-text text-transparent">
              Actually Matter
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Structured, batch-based courses in programming, DevOps, security, and
            cloud. Track your progress with video lessons, exercises, and guided
            learning paths.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                Start Learning Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <a href="#courses">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                <Play className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Free courses available
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-blue-500" />
              Secure & private
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              Self-paced learning
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              {courses.length}+
            </p>
            <p className="text-sm text-muted-foreground mt-1">Courses</p>
          </div>
          <div>
            <p className="text-3xl font-bold">
              {courses.reduce((s, c) => s + c.total_lessons, 0)}+
            </p>
            <p className="text-sm text-muted-foreground mt-1">Lessons</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">
              {courses.filter((c) => c.is_free).length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Free Courses</p>
          </div>
          <div>
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm text-muted-foreground mt-1">Lesson Types</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need to learn effectively
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            A complete LMS platform designed for structured, batch-based learning
            with progress tracking.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: BookOpen,
              title: "Rich Course Content",
              desc: "Video lessons, formatted text, code snippets, and hands-on exercises in every course.",
              color: "bg-blue-500/10 text-blue-600",
            },
            {
              icon: Layers,
              title: "Batch Scheduling",
              desc: "Admin assigns batches with drip-scheduled modules. Content unlocks weekly to keep you on track.",
              color: "bg-violet-500/10 text-violet-600",
            },
            {
              icon: Users,
              title: "Cohort Learning",
              desc: "Learn with your batch mates. Admin manages groups, tracks progress, and sends notifications.",
              color: "bg-green-500/10 text-green-600",
            },
            {
              icon: CheckCircle2,
              title: "Progress Tracking",
              desc: "Mark lessons complete, see per-module progress bars, and celebrate with confetti at 100%.",
              color: "bg-amber-500/10 text-amber-600",
            },
            {
              icon: Lock,
              title: "Access Control",
              desc: "Free courses for everyone. Premium courses via batch access or admin approval.",
              color: "bg-red-500/10 text-red-600",
            },
            {
              icon: Shield,
              title: "Secure Platform",
              desc: "Role-based access, refresh token rotation, blocked user prevention, API-level protection.",
              color: "bg-indigo-500/10 text-indigo-600",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${f.color} mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Course Catalog */}
      <section id="courses" className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <Badge variant="outline" className="mb-3">
              <BookOpen className="h-3 w-3 mr-1" />
              Course Catalog
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">
              Explore Courses
            </h2>
            <p className="text-muted-foreground mt-2">
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
              <div key={i} className="rounded-xl border overflow-hidden animate-pulse">
                <div className="h-44 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-dashed p-16 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-lg">
              {search ? "No courses match your search." : "No courses yet."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/explore/${course.id}`}>
                <div className="rounded-xl border overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer group h-full flex flex-col">
                  {/* Cover */}
                  <GradientCover
                    height="h-44"
                    variant={course.is_free ? "green" : "primary"}
                    iconSize="h-14 w-14"
                  >
                    {course.is_free ? (
                      <Badge className="absolute top-3 right-3 bg-green-600 shadow-sm z-20">
                        FREE
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="absolute top-3 right-3 shadow-sm z-20">
                        <Star className="h-3 w-3 mr-1 text-amber-500" />
                        Premium
                      </Badge>
                    )}
                  </GradientCover>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold mb-1.5 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {course.total_modules} modules
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {course.total_lessons} lessons
                        </span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-6">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
            Create a free account and get instant access to free courses.
            Join a batch for structured, guided learning with scheduled content.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 shadow-lg shadow-primary/20">
                Create Free Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="lg" className="h-12 px-6">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg">BatchLearn</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                A batch-based learning management system for structured course
                delivery. Built with Next.js, FastAPI, PostgreSQL & MinIO.
              </p>
              {/* API Status */}
              <div className="flex items-center gap-2 mt-4">
                <div className={`h-2 w-2 rounded-full ${apiHealthy ? "bg-green-500" : apiHealthy === false ? "bg-red-500" : "bg-yellow-500"}`} />
                <span className="text-xs text-muted-foreground">
                  {apiHealthy ? "API Online" : apiHealthy === false ? "API Offline" : "Checking..."}
                </span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#courses" className="hover:text-foreground transition-colors">Courses</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Register</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/admin" className="hover:text-foreground transition-colors">Admin Portal</Link></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#courses" className="hover:text-foreground transition-colors">All Courses</a></li>
              </ul>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>
              Built with <Heart className="h-3 w-3 inline text-red-500 mx-0.5" /> by{" "}
              <span className="font-medium text-foreground">SiddaramMetri</span>
            </p>
            <p className="text-xs">
              Next.js &middot; FastAPI &middot; PostgreSQL &middot; MinIO &middot; shadcn/ui
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
