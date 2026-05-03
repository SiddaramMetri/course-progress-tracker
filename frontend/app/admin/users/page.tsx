"use client";

import {
  Ban,
  Bell,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Search,
  Send,
  ShieldCheck,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

interface UserAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
  is_blocked: boolean;
  batch_id: string | null;
  batch_name: string | null;
  created_at: string;
  last_login_at: string | null;
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

function SendNotificationDialog({
  userId,
  userName,
  selectedUserIds: externalSelectedIds,
  selectedUserNames,
  allUsers,
  onSent,
}: {
  userId?: string;
  userName?: string;
  selectedUserIds?: string[];
  selectedUserNames?: string[];
  allUsers?: UserAdmin[];
  onSent?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [pickedIds, setPickedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const hasExternalSelection = externalSelectedIds && externalSelectedIds.length > 0;
  const isSingle = !!userId;
  const learners = (allUsers ?? []).filter(
    (u) => u.role === "learner" && !u.is_blocked
  );

  // Effective selected IDs (from external checkbox selection or internal picker)
  const effectiveIds = hasExternalSelection
    ? externalSelectedIds
    : Array.from(pickedIds);
  const effectiveCount = effectiveIds.length;

  const description =
    effectiveCount > 0
      ? `Send to ${effectiveCount} selected student${effectiveCount > 1 ? "s" : ""}.`
      : isSingle
        ? `Send a notification to ${userName}.`
        : "Send a notification to all active learners.";

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setTitle("");
      setMessage("");
      setSearchQuery("");
      if (hasExternalSelection) {
        setPickedIds(new Set(externalSelectedIds));
      } else {
        setPickedIds(new Set());
      }
    }
  };

  const toggleUser = (uid: string) => {
    setPickedIds((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const filteredLearners = learners.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        message: message.trim(),
      };
      if (pickedIds.size > 0) {
        body.user_ids = Array.from(pickedIds);
      } else if (isSingle) {
        body.user_id = userId;
      }

      const result = await apiFetch<{ sent_to: number }>(
        "/notifications/send",
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );
      toast.success(
        `Notification sent to ${result.sent_to} user${result.sent_to > 1 ? "s" : ""}`
      );
      setOpen(false);
      onSent?.();
    } catch {
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger>
        <span className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted cursor-pointer">
          <Send className="h-3 w-3" />
          {hasExternalSelection
            ? `Notify ${externalSelectedIds.length} Selected`
            : isSingle
              ? "Notify"
              : "Send Notification"}
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl overflow-visible">
        <DialogTitle>Send Notification</DialogTitle>
        <DialogDescription>{description}</DialogDescription>

        <div className="space-y-4 mt-2">
          {/* User Picker (only for "Send to All" button which has allUsers) */}
          {!isSingle && allUsers && (
            <div className="space-y-2">
              <Label>Recipients</Label>

              {/* Dropdown trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-between w-full rounded-md border px-3 py-2 text-sm hover:bg-muted/50 transition-colors text-left min-h-[38px]"
                >
                  {pickedIds.size === 0 ? (
                    <span className="text-muted-foreground">
                      All learners ({learners.length})
                    </span>
                  ) : (
                    <span>
                      {pickedIds.size} user{pickedIds.size > 1 ? "s" : ""}{" "}
                      selected
                    </span>
                  )}
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>

                {/* Dropdown panel */}
                {dropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover shadow-lg">
                    {/* Search */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b">
                      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>

                    {/* User list */}
                    <div className="max-h-56 overflow-y-auto">
                      {filteredLearners.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No users found
                        </p>
                      ) : (
                        filteredLearners.map((u) => {
                          const isSelected = pickedIds.has(u.id);
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => toggleUser(u.id)}
                              className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                                isSelected ? "bg-primary/5" : ""
                              }`}
                            >
                              <div
                                className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-muted-foreground/30"
                                }`}
                              >
                                {isSelected && (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {u.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {u.email}
                                </p>
                              </div>
                              {u.batch_name && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] shrink-0"
                                >
                                  {u.batch_name}
                                </Badge>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t px-3 py-1.5 flex items-center justify-between text-xs text-muted-foreground">
                      <button
                        type="button"
                        onClick={() =>
                          setPickedIds(
                            new Set(learners.map((l) => l.id))
                          )
                        }
                        className="hover:text-foreground"
                      >
                        Select all
                      </button>
                      {pickedIds.size > 0 && (
                        <button
                          type="button"
                          onClick={() => setPickedIds(new Set())}
                          className="hover:text-foreground"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(false)}
                        className="font-medium text-primary hover:text-primary/80"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected user chips */}
              {pickedIds.size > 0 && (
                <div className="flex flex-wrap gap-1">
                  {Array.from(pickedIds).map((uid) => {
                    const u = learners.find((l) => l.id === uid);
                    if (!u) return null;
                    return (
                      <Badge
                        key={uid}
                        variant="secondary"
                        className="text-xs gap-1 pr-1 cursor-pointer"
                      >
                        {u.name}
                        <span
                          onClick={() => toggleUser(uid)}
                          className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
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
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
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

const PAGE_SIZE = 25;

function CreateUserDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("learner");
  const [saving, setSaving] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setName("");
      setEmail("");
      setPassword("");
      setRole("learner");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setSaving(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
        }),
      });
      toast.success("User created successfully");
      setOpen(false);
      onCreated();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create user"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger>
        <span className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer">
          <UserPlus className="h-4 w-4" />
          New User
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Create User</DialogTitle>
        <DialogDescription>
          Add a new user to the platform.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="user-name">Name</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-password">Password</Label>
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("learner")}
                className={`flex-1 rounded-lg border p-3 text-center text-sm transition-colors ${
                  role === "learner"
                    ? "border-primary bg-primary/5 font-medium"
                    : "hover:bg-muted"
                }`}
              >
                <User className="h-4 w-4 mx-auto mb-1" />
                Learner
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 rounded-lg border p-3 text-center text-sm transition-colors ${
                  role === "admin"
                    ? "border-primary bg-primary/5 font-medium"
                    : "hover:bg-muted"
                }`}
              >
                <ShieldCheck className="h-4 w-4 mx-auto mb-1" />
                Admin
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={
                saving ||
                !name.trim() ||
                !email.trim() ||
                password.trim().length < 6
              }
            >
              {saving ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const learners = useMemo(
    () => users.filter((u) => u.role === "learner"),
    [users]
  );

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.batch_name && u.batch_name.toLowerCase().includes(q))
    );
  }, [users, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  // Page number generation with ellipsis
  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

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

  // Checkbox handlers
  const toggleSelect = (userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const learnerIdsOnPage = paginatedUsers
      .filter((u) => u.role === "learner")
      .map((u) => u.id);

    const allSelected = learnerIdsOnPage.every((id) => selectedIds.has(id));

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        learnerIdsOnPage.forEach((id) => next.delete(id));
      } else {
        learnerIdsOnPage.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const learnerIdsOnPage = paginatedUsers
    .filter((u) => u.role === "learner")
    .map((u) => u.id);
  const allOnPageSelected =
    learnerIdsOnPage.length > 0 &&
    learnerIdsOnPage.every((id) => selectedIds.has(id));
  const someOnPageSelected =
    learnerIdsOnPage.some((id) => selectedIds.has(id)) && !allOnPageSelected;

  const selectedUserNames = users
    .filter((u) => selectedIds.has(u.id))
    .map((u) => u.name);

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
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <SendNotificationDialog
                  selectedUserIds={Array.from(selectedIds)}
                  selectedUserNames={selectedUserNames}
                  allUsers={users}
                  onSent={clearSelection}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={clearSelection}
                >
                  Clear ({selectedIds.size})
                </Button>
              </>
            )}
            <SendNotificationDialog allUsers={users} />
            <CreateUserDialog onCreated={fetchData} />
          </div>
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
              {
                users.filter((u) => u.role === "learner" && !u.batch_id)
                  .length
              }
            </p>
            <p className="text-[10px] text-muted-foreground">
              No batch assigned
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Pending Requests</p>
            <p className="text-2xl font-semibold text-orange-500">
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

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, email, role, or batch..."
            className="pl-9 h-9"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Selection bar */}
        {selectedIds.size > 0 && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 mb-4 flex items-center justify-between">
            <p className="text-sm font-medium">
              {selectedIds.size} student{selectedIds.size > 1 ? "s" : ""}{" "}
              selected
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const allLearnerIds = learners.map((u) => u.id);
                  setSelectedIds(new Set(allLearnerIds));
                }}
              >
                Select All ({learners.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={clearSelection}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allOnPageSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className={
                      selectedIds.has(user.id) ? "bg-primary/5" : ""
                    }
                  >
                    <TableCell>
                      {user.role === "learner" ? (
                        <Checkbox
                          checked={selectedIds.has(user.id)}
                          onCheckedChange={() => toggleSelect(user.id)}
                        />
                      ) : (
                        <span />
                      )}
                    </TableCell>
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
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                        className="capitalize text-xs"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === "admin" ? (
                        <span className="text-xs text-muted-foreground">
                          —
                        </span>
                      ) : user.batch_id ? (
                        <Badge
                          variant="outline"
                          className="text-xs text-primary border-primary/30"
                        >
                          Batch
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs text-blue-600 border-blue-300"
                        >
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
                        <span className="text-xs text-muted-foreground">
                          —
                        </span>
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
                      {user.last_login_at ? (
                        <span className="text-xs text-muted-foreground" title={new Date(user.last_login_at).toLocaleString()}>
                          {formatTimeAgo(user.last_login_at)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">Never</span>
                      )}
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

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-
              {Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
              {searchQuery && ` (filtered from ${users.length})`}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {pageNumbers.map((page, idx) =>
                page === "ellipsis" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

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
                        selectedUser.role === "admin"
                          ? "default"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {selectedUser.role}
                    </Badge>
                    {selectedUser.is_blocked && (
                      <Badge variant="destructive">Blocked</Badge>
                    )}
                    {selectedUser.batch_name && (
                      <Badge variant="outline">
                        {selectedUser.batch_name}
                      </Badge>
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
                              {course.completed_lessons}/
                              {course.total_lessons}
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
