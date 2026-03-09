import { type Metadata } from "next";
import { dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { blogQueries } from "@/lib/queries/blog.queries";
import { getCookiesToken } from "@/lib/auth.utils";
import { BlogListClient } from "@/modules/blog/components/BlogListClient";
import { Header } from "@/app/(landing-page)/components/Header";
import { Footer } from "@/components/landing-page/Footer";

export const metadata: Metadata = {
  title: "Blog | Cver AI",
  description:
    "Insights on job searching, resume writing, interview prep, and career growth.",
};

// Revalidate every 5 minutes — blog list is public and can be ISR-cached
export const revalidate = 300;

export default async function BlogPage() {
  const token = (await getCookiesToken()) ?? "";
  const isAuthenticated = !!token;

  const queryClient = createServerQueryClient();

  // Prefetch first page — must use blogQueries.list so the key matches what BlogListClient uses
  await queryClient.prefetchQuery(
    blogQueries.list({ status: "publish", page: 1, limit: 12 }),
  );

  return (
    <section className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
        {/* Page heading */}
        <div className="text-center space-y-2">
          <h1 className="font-poppins text-3xl font-semibold md:text-4xl">
            Blog
          </h1>
          <p className="text-muted-foreground text-sm">
            Career insights, job search strategies, and product updates.
          </p>
        </div>

        {/* Client island — consumes the prefetched cache */}
        <HydrationBoundary state={dehydrate(queryClient)}>
          <BlogListClient
            initialFilters={{ status: "publish", page: 1, limit: 12 }}
            isAuthenticated={isAuthenticated}
          />
        </HydrationBoundary>
      </main>

      <Footer />
    </section>
  );
}
