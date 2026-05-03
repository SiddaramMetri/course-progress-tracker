"use client";

import { CourseList } from "@/components/course-list";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-2">
            Track your learning progress across all courses.
          </p>
        </div>
        <CourseList />
      </div>
    </div>
  );
}
