"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Inbox,
  Layers,
  Lock,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { CourseList } from "@/components/course-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useCourses } from "@/hooks/use-courses";
import { apiFetch } from "@/lib/api";

interface AccessRequest {
  id: string;
  course_id: string;
  course_title: string;
  status: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface UserAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  is_blocked: boolean;
  batch_id: string | null;
  created_at: string;
  progress_percent: number;
}

interface BatchOption {
  id: string;
  name: string;
}

// --- Admin Dashboard ---
function AdminDashboard() {
  const { courses } = useCourses();

  const { data: users = [] } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiFetch<UserAdmin[]>("/admin/users"),
  });

  const { data: batches = [] } = useQuery({
    queryKey: ["admin", "batches"],
    queryFn: () => apiFetch<BatchOption[]>("/admin/batches"),
  });

  const { data: accessRequests = [] } = useQuery({
    queryKey: ["admin", "access-requests"],
    queryFn: () => apiFetch<AccessRequest[]>("/admin/access-requests"),
  });

  const learners = users.filter((u) => u.role === "learner");
  const totalLessons = courses.reduce((s, c) => s + c.total_count, 0);
  const pendingRequests = accessRequests.filter((r) => r.status === "pending");
  const freeCourses = courses.filter((c) => c.is_free);
  const premiumCourses = courses.filter((c) => !c.is_free);
  const avgProgress =
    learners.length > 0
      ? Math.round(
          learners.reduce((s, u) => s + u.progress_percent, 0) /
            learners.length
        )
      : 0;

  // Recent users (last 5 by created_at)
  const recentUsers = [...users]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your platform activity and stats.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border p-4 flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-medium">Total Courses</span>
          </div>
          <p className="text-3xl font-bold">{courses.length}</p>
          <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
            <span className="text-green-600">{freeCourses.length} free</span>
            <span>·</span>
            <span className="text-amber-600">
              {premiumCourses.length} premium
            </span>
          </div>
        </div>

        <div className="rounded-xl border p-4 flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">Total Learners</span>
          </div>
          <p className="text-3xl font-bold">{learners.length}</p>
          <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
            <span>
              {learners.filter((l) => l.batch_id).length} in batches
            </span>
          </div>
        </div>

        <div className="rounded-xl border p-4 flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Layers className="h-4 w-4" />
            <span className="text-xs font-medium">Total Lessons</span>
          </div>
          <p className="text-3xl font-bold">{totalLessons}</p>
          <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
            <span>across {courses.length} courses</span>
          </div>
        </div>

        <div className="rounded-xl border p-4 flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Avg Progress</span>
          </div>
          <p className="text-3xl font-bold">{avgProgress}%</p>
          <Progress value={avgProgress} className="h-1.5 mt-2" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Quick Access */}
        <div className="rounded-xl border p-5 md:col-span-1">
          <h2 className="text-sm font-semibold mb-4">Quick Access</h2>
          <div className="space-y-2">
            <Link href="/admin/courses">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Manage Courses</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/admin/users">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Manage Users</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/admin/batches">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Layers className="h-4 w-4 text-violet-600" />
                  </div>
                  <span className="text-sm font-medium">Manage Batches</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {batches.length}
                </Badge>
              </div>
            </Link>
            <Link href="/admin/requests">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Inbox className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium">Access Requests</span>
                </div>
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {pendingRequests.length} pending
                  </Badge>
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-xl border p-5 md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Recent Users</h2>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                View all
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3"
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {u.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {u.email}
                  </p>
                </div>
                <Badge
                  variant={u.role === "admin" ? "default" : "secondary"}
                  className="text-[10px] capitalize shrink-0"
                >
                  {u.role}
                </Badge>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users yet
              </p>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="rounded-xl border p-5 md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Pending Requests</h2>
            <Link href="/admin/requests">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                View all
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-6">
                <Inbox className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No pending requests
                </p>
              </div>
            ) : (
              pendingRequests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 p-2 rounded-lg border border-orange-100 bg-orange-50/50"
                >
                  <Clock className="h-4 w-4 text-orange-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {req.course_title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {req.user_name || req.user_email || "Unknown"}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-orange-600 border-orange-300 shrink-0"
                  >
                    Pending
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Course Progress Overview */}
      <div className="rounded-xl border p-5">
        <h2 className="text-sm font-semibold mb-4">Course Overview</h2>
        <div className="space-y-3">
          {courses.map((course) => {
            const pct =
              course.total_count > 0
                ? Math.round(
                    (course.completed_count / course.total_count) * 100
                  )
                : 0;
            return (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {course.title}
                      </p>
                      {course.is_free ? (
                        <Badge className="bg-blue-600 text-[10px] shrink-0">
                          FREE
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-[10px] shrink-0"
                        >
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {course.total_count} lessons
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-40">
                    <Progress value={pct} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Learner Dashboard ---
function LearnerDashboard() {
  const { courses } = useCourses();
  const { user, isLearner, isAuthenticated } = useAuth();
  const hasBatch = !!user?.batch_name;

  const { data: myRequests } = useQuery({
    queryKey: ["my-access-requests"],
    queryFn: () => apiFetch<AccessRequest[]>("/public/my-access-requests"),
    enabled: isLearner && isAuthenticated,
  });

  const pendingRequests = (myRequests ?? []).filter(
    (r) => r.status === "pending"
  );
  const approvedRequests = (myRequests ?? []).filter(
    (r) => r.status === "approved"
  );
  const rejectedRequests = (myRequests ?? []).filter(
    (r) => r.status === "rejected"
  );

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your learning progress across all courses.
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm">
            Browse All Courses
          </Button>
        </Link>
      </div>

      {/* Banner for learners without batch */}
      {!hasBatch && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Want access to more courses?
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Browse our course catalog and request access to additional
              courses.
            </p>
            <Link href="/#courses" className="inline-block mt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* My Courses */}
      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="font-medium mb-1">No courses yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            {hasBatch
              ? "Your batch courses will appear here once published."
              : "Browse our course catalog to find courses."}
          </p>
          <Link href="/">
            <Button variant="outline">Browse Courses</Button>
          </Link>
        </div>
      ) : (
        <CourseList />
      )}

      {/* Access Requests Section */}
      {(myRequests ?? []).length > 0 && (
        <>
          <Separator className="my-8" />
          <div>
            <h2 className="text-lg font-semibold mb-4">
              My Access Requests
            </h2>
            <div className="space-y-2">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3"
                >
                  <Clock className="h-4 w-4 text-orange-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {req.course_title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Waiting for admin approval
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-300"
                  >
                    Pending
                  </Badge>
                </div>
              ))}
              {approvedRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3"
                >
                  <BookOpen className="h-4 w-4 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {req.course_title}
                    </p>
                    <p className="text-xs text-green-700">
                      Access approved! Ask admin to assign you to a batch.
                    </p>
                  </div>
                  <Badge className="bg-green-600">Approved</Badge>
                </div>
              ))}
              {rejectedRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 rounded-lg border p-3 opacity-60"
                >
                  <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {req.course_title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Request was not approved
                    </p>
                  </div>
                  <Badge variant="secondary">Rejected</Badge>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { isAdmin } = useAuth();

  return (
    <AppShell>
      {isAdmin ? <AdminDashboard /> : <LearnerDashboard />}
    </AppShell>
  );
}
