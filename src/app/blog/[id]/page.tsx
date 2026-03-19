import { type Metadata } from "next";
import { dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { createServerQueryClient } from "@/shared/query/prefetch";
import { blogQueries } from "@/features/blog/queries/blog.queries";
import { getCookiesToken } from "@/lib/auth.utils";
import { BlogDetailClient } from "@/modules/blog/components/BlogDetailClient";
import { Header } from "@/app/(landing-page)/components/Header";
import { Footer } from "@/components/landing-page/Footer";

interface BlogPostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const queryClient = createServerQueryClient();
    const blog = await queryClient.fetchQuery(blogQueries.detail(id));

    return {
      title: blog ? `${blog.title} | Cver AI Blog` : "Blog Post | Cver AI",
      description: blog?.summary ?? blog?.subtitle ?? undefined,
      openGraph: blog?.bigThumbnail
        ? {
            images: [{ url: blog.bigThumbnail }],
          }
        : undefined,
    };
  } catch {
    return { title: "Blog Post | Cver AI" };
  }
}

// ISR: revalidate per-post page every 10 minutes
export const revalidate = 600;

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  const token = (await getCookiesToken()) ?? "";
  const isAuthenticated = !!token;

  const queryClient = createServerQueryClient();

  // Prefetch the post so the client renders instantly (no loading spinner on first load)
  await queryClient.prefetchQuery(blogQueries.detail(id));

  return (
    <section className="min-h-screen">
      <Header />

      <main className="py-10">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <BlogDetailClient blogId={id} isAuthenticated={isAuthenticated} />
        </HydrationBoundary>
      </main>

      <Footer />
    </section>
  );
}
