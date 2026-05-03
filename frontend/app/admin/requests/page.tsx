"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, Inbox, X } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";

interface AccessRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  course_id: string;
  course_title: string;
  status: string;
  message: string | null;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AccessRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin", "access-requests"],
    queryFn: () => apiFetch<AccessRequest[]>("/admin/access-requests"),
  });

  const handleApprove = async (id: string) => {
    try {
      await apiFetch(`/admin/access-requests/${id}/approve`, {
        method: "POST",
      });
      toast.success("Access request approved");
      queryClient.invalidateQueries({ queryKey: ["admin", "access-requests"] });
    } catch {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiFetch(`/admin/access-requests/${id}/reject`, {
        method: "POST",
      });
      toast.success("Access request rejected");
      queryClient.invalidateQueries({ queryKey: ["admin", "access-requests"] });
    } catch {
      toast.error("Failed to reject request");
    }
  };

  const items = requests ?? [];
  const pending = items.filter((r) => r.status === "pending");
  const resolved = items.filter((r) => r.status !== "pending");

  return (
    <AppShell>
      <div className="px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Inbox className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Access Requests
            </h1>
            <p className="text-sm text-muted-foreground">
              Review and manage course access requests from learners.
            </p>
          </div>
          {pending.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pending.length} pending
            </Badge>
          )}
        </div>

        {/* Pending Requests */}
        {pending.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Pending Requests
            </h2>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{req.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {req.user_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{req.course_title}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
                        {req.message || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {timeAgo(req.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            className="h-7 bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(req.id)}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-destructive"
                            onClick={() => handleReject(req.id)}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Resolved / All */}
        <div>
          <h2 className="text-sm font-semibold mb-3">
            {pending.length > 0 ? "Past Requests" : "All Requests"}
          </h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Loading...
            </p>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <Inbox className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                No access requests yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                When learners request access to premium courses, they will
                appear here.
              </p>
            </div>
          ) : resolved.length === 0 && pending.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              No past requests yet.
            </p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolved.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{req.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {req.user_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{req.course_title}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            req.status === "approved"
                              ? "default"
                              : "destructive"
                          }
                          className={
                            req.status === "approved" ? "bg-green-600" : ""
                          }
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {timeAgo(req.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
