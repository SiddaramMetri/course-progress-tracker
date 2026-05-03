"use client";

import {
  Bell,
  BookOpen,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  User,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useCourses } from "@/hooks/use-courses";
import { apiFetch } from "@/lib/api";

import { CourseProgress } from "./course-progress";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { courses } = useCourses();
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = user?.role === "admin";
  const totalLessons = courses.reduce((s, c) => s + c.total_count, 0);
  const totalCompleted = courses.reduce((s, c) => s + c.completed_count, 0);

  useEffect(() => {
    apiFetch<{ count: number }>("/notifications/unread-count")
      .then((d) => setUnreadCount(d.count))
      .catch(() => {});
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItem = (
    href: string,
    icon: React.ReactNode,
    label: string,
    badge?: React.ReactNode
  ) => (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${
        pathname === href
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge}
    </Link>
  );

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
        {/* Main Menu */}
        <div className="mb-1">
          <p className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Menu
          </p>
          {navItem("/", <LayoutDashboard className="h-4 w-4" />, "Dashboard")}
          {navItem(
            "/notifications",
            <Bell className="h-4 w-4" />,
            "Notifications",
            unreadCount > 0 ? (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center">
                {unreadCount}
              </Badge>
            ) : undefined
          )}
          {navItem(
            "/account",
            <UserCircle className="h-4 w-4" />,
            "Account"
          )}
        </div>

        <Separator className="my-4" />

        {/* Courses */}
        <div>
          <p className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            My Courses
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

        {/* Admin Section */}
        {isAdmin && (
          <>
            <Separator className="my-4" />
            <div>
              <p className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Admin
              </p>
              {navItem(
                "/admin/users",
                <Users className="h-4 w-4" />,
                "Users"
              )}
              {navItem(
                "/admin/batches",
                <Layers className="h-4 w-4" />,
                "Batches"
              )}
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

      {/* User Profile */}
      <div className="border-t px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {user?.role}
              </Badge>
              {user?.batch_name && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {user.batch_name}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
