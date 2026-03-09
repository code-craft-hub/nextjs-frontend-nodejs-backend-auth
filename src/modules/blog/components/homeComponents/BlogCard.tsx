"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogWithViews } from "@/lib/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

function estimateReadTime(html: string | null): number {
  if (!html) return 1;
  const words = html.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ─── BlogCard ────────────────────────────────────────────────────────────────

interface BlogCardProps {
  blog: BlogWithViews;
  onMouseEnter?: (id: string) => void;
  className?: string;
}

export function BlogCard({ blog, onMouseEnter, className }: BlogCardProps) {
  const thumbnail = blog.bigThumbnail ?? blog.blogCover ?? "";
  const readTime = estimateReadTime(blog.descriptionHtml);

  return (
    <Link
      href={`/blog/${blog.id}`}
      onMouseEnter={() => onMouseEnter?.(blog.id)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card",
        "transition-shadow duration-300 hover:shadow-lg focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {/* Cover image */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={blog.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-4xl text-primary/30">✍</span>
          </div>
        )}
        {blog.category && (
          <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-medium text-primary-foreground shadow">
            {blog.category}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h2 className="line-clamp-2 font-poppins text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          {blog.title}
        </h2>

        {blog.summary && (
          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {blog.summary}
          </p>
        )}

        {/* Author row */}
        {blog.authorName && (
          <div className="flex items-center gap-2">
            {blog.authorAvatar ? (
              <Image
                src={blog.authorAvatar}
                alt={blog.authorName}
                width={24}
                height={24}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                {blog.authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
              {blog.authorName}
            </span>
          </div>
        )}

        {/* Meta row */}
        <div className="mt-auto flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {formatDate(blog.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {readTime} min read
          </span>
          {blog.totalViews > 0 && (
            <span className="flex items-center gap-1 ml-auto">
              <Eye className="size-3" />
              {blog.totalViews.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── BlogCardSkeleton ────────────────────────────────────────────────────────

export function BlogCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border bg-card",
        className,
      )}
    >
      <div className="h-48 w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-auto flex gap-3">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
