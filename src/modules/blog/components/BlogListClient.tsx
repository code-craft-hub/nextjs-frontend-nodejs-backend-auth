"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { blogQueries } from "@/lib/queries/blog.queries";
import { BlogCard, BlogCardSkeleton } from "./homeComponents/BlogCard";
import type { BlogFilters } from "@/lib/api/blog.api";

// ─── BlogListClient ─────────────────────────────────────────────────────────

interface BlogListClientProps {
  initialFilters?: BlogFilters;
  isAuthenticated?: boolean;
}

export function BlogListClient({ initialFilters, isAuthenticated: _isAuthenticated }: BlogListClientProps) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<BlogFilters>({
    status: "publish",
    page: 1,
    limit: 12,
    ...initialFilters,
  });
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useQuery(blogQueries.list(filters));

  // Prefetch a blog detail on card hover
  const handleCardHover = useCallback(
    (id: string) => {
      queryClient.prefetchQuery(blogQueries.detail(id));
    },
    [queryClient],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
  };

  const handleCategoryClick = (category: string | null) => {
    setFilters((prev) => ({
      ...prev,
      category: category ?? undefined,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const blogs = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = filters.page ?? 1;

  // Collect unique categories for filter bar
  const categories = Array.from(
    new Set(blogs.map((b) => b.category).filter(Boolean)),
  ) as string[];

  return (
    <section className="space-y-8">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              !filters.category
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                filters.category === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${
          isFetching && !isLoading ? "opacity-60" : "opacity-100"
        }`}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)
          : blogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                onMouseEnter={handleCardHover}
              />
            ))}
      </div>

      {/* Empty state */}
      {!isLoading && blogs.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg font-medium">No posts found.</p>
          {filters.search && (
            <p className="mt-1 text-sm">
              Try a different search term or{" "}
              <button
                className="text-primary underline"
                onClick={() => {
                  setSearch("");
                  setFilters((prev) => ({ ...prev, search: undefined, page: 1 }));
                }}
              >
                clear the search
              </button>
              .
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-muted transition"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-muted transition"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
