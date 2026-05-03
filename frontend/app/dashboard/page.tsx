"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Eye, EyeOff, ExternalLink, Lock, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { CourseFormDialog } from "@/components/course-form-dialog";
import { CourseList } from "@/components/course-list";
import { AdminOnly } from "@/components/require-role";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
}

export default function DashboardPage() {
  const { refetch, courses } = useCourses();
  const { user, isAdmin, isLearner, isAuthenticated } = useAuth();

  const hasBatch = !!user?.batch_name;
  const [learnerPreview, setLearnerPreview] = useState(false);

  // In learner preview mode, admin sees the dashboard as a learner
  const showAsAdmin = isAdmin && !learnerPreview;

  // Fetch learner's access requests
  const { data: myRequests } = useQuery({
    queryKey: ["my-access-requests"],
    queryFn: () => apiFetch<AccessRequest[]>("/public/my-access-requests"),
    enabled: isLearner && isAuthenticated,
  });

  const pendingRequests = (myRequests ?? []).filter((r) => r.status === "pending");
  const approvedRequests = (myRequests ?? []).filter((r) => r.status === "approved");
  const rejectedRequests = (myRequests ?? []).filter((r) => r.status === "rejected");

  return (
    <AppShell>
      <div className="px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your learning progress across all courses.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant={learnerPreview ? "default" : "outline"}
                size="sm"
                onClick={() => setLearnerPreview(!learnerPreview)}
                className={learnerPreview ? "bg-violet-600 hover:bg-violet-700" : ""}
              >
                {learnerPreview ? (
                  <><EyeOff className="h-3.5 w-3.5 mr-1" /> Exit Preview</>
                ) : (
                  <><Eye className="h-3.5 w-3.5 mr-1" /> View as Learner</>
                )}
              </Button>
            )}
            <Link href="/">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Browse All Courses
              </Button>
            </Link>
            {showAsAdmin && (
              <CourseFormDialog
                mode="create"
                onSuccess={refetch}
                trigger={
                  <span className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    New Course
                  </span>
                }
              />
            )}
          </div>
        </div>

        {/* Learner preview banner */}
        {learnerPreview && (
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 mb-6 flex items-center gap-3">
            <Eye className="h-5 w-5 text-violet-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-violet-900">
                Learner Preview Mode
              </p>
              <p className="text-xs text-violet-700">
                You are viewing the dashboard as a learner would see it. Admin controls are hidden.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-violet-300 text-violet-700 hover:bg-violet-100"
              onClick={() => setLearnerPreview(false)}
            >
              <EyeOff className="h-3.5 w-3.5 mr-1" />
              Exit
            </Button>
          </div>
        )}

        {/* Banner for learners without batch */}
        {isLearner && !hasBatch && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Want access to premium courses?
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                You currently have access to free courses only. Browse our
                premium courses and request access.
              </p>
              <Link href="/#courses" className="inline-block mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  Explore Premium Courses
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* My Courses */}
        {courses.length === 0 && !isAdmin ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium mb-1">No courses yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              {hasBatch
                ? "Your batch courses will appear here once published."
                : "Browse our course catalog to find free courses."}
            </p>
            <Link href="/">
              <Button variant="outline">Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <CourseList hideAdminControls={learnerPreview} />
        )}

        {/* Access Requests Section (learner only) */}
        {isLearner && (myRequests ?? []).length > 0 && (
          <>
            <Separator className="my-8" />
            <div>
              <h2 className="text-lg font-semibold mb-4">
                My Access Requests
              </h2>
              <div className="space-y-2">
                {/* Pending */}
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3"
                  >
                    <Clock className="h-4 w-4 text-orange-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{req.course_title}</p>
                      <p className="text-xs text-muted-foreground">
                        Waiting for admin approval
                      </p>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Pending
                    </Badge>
                  </div>
                ))}

                {/* Approved */}
                {approvedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3"
                  >
                    <BookOpen className="h-4 w-4 text-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{req.course_title}</p>
                      <p className="text-xs text-green-700">
                        Access approved! Ask admin to assign you to a batch.
                      </p>
                    </div>
                    <Badge className="bg-green-600">Approved</Badge>
                  </div>
                ))}

                {/* Rejected */}
                {rejectedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center gap-3 rounded-lg border p-3 opacity-60"
                  >
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{req.course_title}</p>
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
    </AppShell>
  );
}
