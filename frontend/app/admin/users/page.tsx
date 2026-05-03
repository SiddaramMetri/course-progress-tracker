"use client";

import {
  Ban,
  Bell,
  CheckCircle,
  Eye,
  Send,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";

interface UserAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
  is_blocked: boolean;
  batch_id: string | null;
  batch_name: string | null;
  created_at: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
}

interface BatchOption {
  id: string;
  name: string;
}

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  is_blocked: boolean;
  batch_name: string | null;
  courses: {
    course_id: string;
    course_title: string;
    total_lessons: number;
    completed_lessons: number;
    progress_percent: number;
  }[];
}

function SendNotificationDialog({ userId, userName }: { userId?: string; userName?: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await apiFetch("/notifications/send", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId || null,
          title: title.trim(),
          message: message.trim(),
        }),
      });
      setOpen(false);
      setTitle("");
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <span className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted cursor-pointer">
          <Send className="h-3 w-3" />
          {userId ? "Notify" : "Send to All"}
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Send Notification</DialogTitle>
        <DialogDescription>
          {userId
            ? `Send a notification to ${userName}.`
            : "Send a notification to all active learners."}
        </DialogDescription>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSend}
              disabled={sending || !title.trim() || !message.trim()}
            >
              <Bell className="h-4 w-4 mr-1" />
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [u, b] = await Promise.all([
        apiFetch<UserAdmin[]>("/admin/users"),
        apiFetch<BatchOption[]>("/admin/batches"),
      ]);
      setUsers(u);
      setBatches(b);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBlock = async (userId: string) => {
    await apiFetch(`/admin/users/${userId}/block`, { method: "POST" });
    fetchData();
  };

  const handleUnblock = async (userId: string) => {
    await apiFetch(`/admin/users/${userId}/unblock`, { method: "POST" });
    fetchData();
  };

  const handleBatchChange = async (
    userId: string,
    batchId: string | null
  ) => {
    await apiFetch(`/admin/users/${userId}/batch`, {
      method: "PUT",
      body: JSON.stringify({
        batch_id: batchId === "none" ? null : batchId,
      }),
    });
    fetchData();
  };

  const handleViewDetail = async (userId: string) => {
    const detail = await apiFetch<UserDetail>(`/admin/users/${userId}`);
    setSelectedUser(detail);
    setDetailOpen(true);
  };

  return (
    <AppShell>
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                User Management
              </h1>
              <p className="text-sm text-muted-foreground">
                View student progress, manage accounts and batch assignments.
              </p>
            </div>
          </div>
          <SendNotificationDialog />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="text-2xl font-semibold">{users.length}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Batch Learners</p>
            <p className="text-2xl font-semibold text-primary">
              {users.filter((u) => u.role === "learner" && u.batch_id).length}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Self-Registered</p>
            <p className="text-2xl font-semibold text-blue-600">
              {users.filter((u) => u.role === "learner" && !u.batch_id).length}
            </p>
            <p className="text-[10px] text-muted-foreground">No batch assigned</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Pending Requests</p>
            <p className="text-2xl font-semibold text-orange-500">
              {/* Will be shown from sidebar badge */}
              <Link href="/admin/requests" className="hover:underline">
                View
              </Link>
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Blocked</p>
            <p className="text-2xl font-semibold text-destructive">
              {users.filter((u) => u.is_blocked).length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {user.role === "admin" ? (
                            <ShieldCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className="capitalize text-xs"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === "admin" ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : user.batch_id ? (
                        <Badge variant="outline" className="text-xs text-primary border-primary/30">
                          Batch
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                          Self-Registered
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.role === "learner" ? (
                        <select
                          value={user.batch_id ?? "none"}
                          onChange={(e) =>
                            handleBatchChange(user.id, e.target.value)
                          }
                          className="h-8 w-[140px] text-xs rounded-md border bg-background px-2"
                        >
                          <option value="none">No batch</option>
                          {batches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 w-32">
                        <Progress
                          value={user.progress_percent}
                          className="h-2 flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {user.progress_percent}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.is_blocked ? (
                        <Badge variant="destructive" className="text-xs">
                          Blocked
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-xs text-green-700"
                        >
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDetail(user.id)}
                          title="View progress"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.role === "learner" &&
                          (user.is_blocked ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600"
                              onClick={() => handleUnblock(user.id)}
                              title="Unblock"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleBlock(user.id)}
                              title="Block"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* User Detail Side Panel */}
        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
            {selectedUser && (
              <>
                <SheetHeader>
                  <SheetTitle>{selectedUser.name}</SheetTitle>
                  <SheetDescription>{selectedUser.email}</SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-4 space-y-4">
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        selectedUser.role === "admin" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {selectedUser.role}
                    </Badge>
                    {selectedUser.is_blocked && (
                      <Badge variant="destructive">Blocked</Badge>
                    )}
                    {selectedUser.batch_name && (
                      <Badge variant="outline">{selectedUser.batch_name}</Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">
                      Course Progress
                    </h3>
                    <div className="space-y-3">
                      {selectedUser.courses.map((course) => (
                        <div
                          key={course.course_id}
                          className="rounded-lg border p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">
                              {course.course_title}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {course.completed_lessons}/{course.total_lessons}
                            </span>
                          </div>
                          <Progress
                            value={course.progress_percent}
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {course.progress_percent}% complete
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}
