"use client";

import { Play, Upload, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch, apiUpload } from "@/lib/api";

interface VideoPlayerProps {
  youtubeUrl?: string | null;
  storageKey?: string | null;
  lessonId: string;
  onVideoChange?: () => void;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function VideoPlayer({
  youtubeUrl,
  storageKey,
  lessonId,
  onVideoChange,
}: VideoPlayerProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [minioVideoUrl, setMinioVideoUrl] = useState<string | null>(null);

  // Fetch presigned URL for MinIO-hosted video
  useEffect(() => {
    if (!storageKey) {
      setMinioVideoUrl(null);
      return;
    }
    apiFetch<{ video_url: string }>(`/lessons/${lessonId}/video-url`)
      .then((data) => setMinioVideoUrl(data.video_url))
      .catch(() => setMinioVideoUrl(null));
  }, [storageKey, lessonId]);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/")) {
        alert("Please select a video file");
        return;
      }
      setUploading(true);
      try {
        await apiUpload(`/lessons/${lessonId}/video`, file);
        onVideoChange?.();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [lessonId, onVideoChange]
  );

  const handleDelete = useCallback(async () => {
    if (!confirm("Remove this uploaded video?")) return;
    await apiFetch(`/lessons/${lessonId}/video`, { method: "DELETE" });
    onVideoChange?.();
  }, [lessonId, onVideoChange]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [handleUpload]
  );

  // Self-hosted MinIO video
  if (storageKey && minioVideoUrl) {
    return (
      <div className="space-y-2">
        <div className="relative w-full rounded-lg overflow-hidden border bg-black aspect-video">
          <video
            key={minioVideoUrl}
            controls
            className="absolute inset-0 w-full h-full"
            preload="metadata"
          >
            <source src={minioVideoUrl} />
            Your browser does not support the video tag.
          </video>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-3.5 w-3.5 mr-1" />
              {uploading ? "Uploading..." : "Replace Video"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Remove
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
    );
  }

  // YouTube video
  if (youtubeUrl) {
    const videoId = extractYouTubeId(youtubeUrl);
    if (videoId) {
      return (
        <div className="space-y-2">
          <div className="relative w-full rounded-lg overflow-hidden border bg-black aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
              title="Lesson video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-3.5 w-3.5 mr-1" />
                {uploading ? "Uploading..." : "Upload Custom Video"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>
      );
    }
  }

  // No video - admin can upload
  if (isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 aspect-video">
        {uploading ? (
          <p className="text-sm text-muted-foreground">Uploading video...</p>
        ) : (
          <>
            <Play className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              No video yet
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5 mr-1" />
              Upload Video
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              MP4, WebM, MOV up to 500 MB
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  // No video, learner view - show nothing
  return null;
}
