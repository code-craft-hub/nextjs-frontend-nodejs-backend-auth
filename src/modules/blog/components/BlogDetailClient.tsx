"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Calendar, Clock, Eye } from "lucide-react";
import { blogQueries } from "@/lib/queries/blog.queries";
import { BlogCard, BlogCardSkeleton } from "./homeComponents/BlogCard";
import { useBlogMetrics } from "../hooks/useBlogMetrics";
import type { BlogWithViews } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

function estimateReadTime(html: string | null): number {
  if (!html) return 1;
  const words = html.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ─── Related blogs ────────────────────────────────────────────────────────────

function RelatedBlogs({ related }: { related: unknown }) {
  if (!Array.isArray(related) || related.length === 0) return null;

  const relatedList = related as BlogWithViews[];

  return (
    <section className="mt-20 space-y-6">
      <h2 className="font-poppins text-2xl font-bold">Keep reading</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relatedList.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  );
}

// ─── Author card ─────────────────────────────────────────────────────────────

function AuthorCard({
  authorName,
  authorAvatar,
  authorComment,
}: {
  authorName: string | null;
  authorAvatar: string | null;
  authorComment: string | null;
}) {
  if (!authorName) return null;

  return (
    <div className="mt-16 flex items-center gap-4 rounded-2xl bg-muted/60 p-6 max-w-md mx-auto">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
        {authorAvatar ? (
          <Image
            src={authorAvatar}
            alt={authorName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-primary/20 text-lg font-bold text-primary">
            {authorName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="font-merriweather font-bold">Written by {authorName}</p>
        {authorComment && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {authorComment}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── BlogDetailClient ─────────────────────────────────────────────────────────

interface BlogDetailClientProps {
  blogId: string;
  isAuthenticated: boolean;
}

export function BlogDetailClient({
  blogId,
  isAuthenticated,
}: BlogDetailClientProps) {
  const { data: blog, isLoading } = useQuery(blogQueries.detail(blogId));

  useBlogMetrics({
    blogId,
    blogTitle: blog?.title ?? "",
    isAuthenticated,
  });

  if (isLoading) {
    return <BlogDetailSkeleton />;
  }

  if (!blog) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground">Post not found.</p>
        <Link href="/blog" className="mt-4 inline-block text-sm text-primary underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  const thumbnail = blog.bigThumbnail ?? blog.blogCover ?? "";
  const readTime = estimateReadTime(blog.descriptionHtml);

  return (
    <article className="max-w-screen-md mx-auto px-4 sm:px-8 pb-16 space-y-8">
      {/* Back nav */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <ChevronLeft className="size-4" />
        Back to Blog
      </Link>

      {/* Header */}
      <header className="space-y-4">
        {blog.category && (
          <span className="inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
            {blog.category}
          </span>
        )}
        <h1 className="font-poppins text-2xl font-semibold leading-tight md:text-3xl">
          {blog.title}
        </h1>
        {blog.subtitle && (
          <p className="text-lg font-medium text-muted-foreground">
            {blog.subtitle}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {blog.authorName && (
            <span className="flex items-center gap-1.5">
              {blog.authorAvatar ? (
                <Image
                  src={blog.authorAvatar}
                  alt={blog.authorName}
                  width={20}
                  height={20}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary">
                  {blog.authorName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="font-medium">{blog.authorName}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {formatDate(blog.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {readTime} min read
          </span>
          {blog.totalViews > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {blog.totalViews.toLocaleString()} views
            </span>
          )}
        </div>
      </header>

      {/* Cover image */}
      {thumbnail && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
          <Image
            src={thumbnail}
            alt={blog.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover object-center"
          />
        </div>
      )}

      {/* Body */}
      {blog.descriptionHtml && (
        <div
          className="prose prose-sm sm:prose max-w-none prose-headings:font-poppins prose-img:rounded-xl prose-a:text-primary hover:prose-a:underline dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: blog.descriptionHtml }}
        />
      )}

      {/* Author card */}
      <AuthorCard
        authorName={blog.authorName}
        authorAvatar={blog.authorAvatar}
        authorComment={blog.authorComment}
      />

      {/* Related posts */}
      <RelatedBlogs related={blog.related} />
    </article>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BlogDetailSkeleton() {
  return (
    <div className="max-w-screen-md mx-auto px-4 sm:px-8 pb-16 space-y-6 animate-pulse">
      <div className="h-4 w-16 rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-8 w-3/4 rounded bg-muted" />
        <div className="h-5 w-1/2 rounded bg-muted" />
        <div className="flex gap-3">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
      </div>
      <div className="aspect-video w-full rounded-2xl bg-muted" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-muted" style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
      <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
