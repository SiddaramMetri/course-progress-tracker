"use client";

import {
  BookOpen,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useCourses } from "@/hooks/use-courses";

import { CourseProgress } from "./course-progress";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { courses } = useCourses();

  const isAdmin = user?.role === "admin";
  const totalLessons = courses.reduce((s, c) => s + c.total_count, 0);
  const totalCompleted = courses.reduce((s, c) => s + c.completed_count, 0);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4 border-b">
        <GraduationCap className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm tracking-tight">
          Course Tracker
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-1">
          <p className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Menu
          </p>
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        <Separator className="my-4" />

        <div>
          <p className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Courses
          </p>
          <ul className="flex flex-col gap-1">
            {courses.map((course) => {
              const isActive = pathname === `/courses/${course.id}`;
              const pct =
                course.total_count > 0
                  ? Math.round(
                      (course.completed_count / course.total_count) * 100
                    )
                  : 0;

              return (
                <li key={course.id}>
                  <Link
                    href={`/courses/${course.id}`}
                    className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span className="truncate flex-1">{course.title}</span>
                    <Badge
                      variant={pct === 100 ? "default" : "secondary"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {pct}%
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {isAdmin && (
          <>
            <Separator className="my-4" />
            <div>
              <p className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Admin
              </p>
              <Link
                href="/admin/users"
                className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${
                  pathname === "/admin/users"
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Users className="h-4 w-4" />
                Users
              </Link>
              <Link
                href="/admin/batches"
                className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${
                  pathname === "/admin/batches"
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Layers className="h-4 w-4" />
                Batches
              </Link>
            </div>
          </>
        )}
      </nav>

      {/* Overall Progress */}
      <div className="border-t px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Overall Progress
        </p>
        <CourseProgress
          completed={totalCompleted}
          total={totalLessons}
          size="sm"
        />
      </div>

      {/* User Info + Logout */}
      <div className="border-t px-4 py-3 flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {user?.name}
          </p>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {user?.role}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
