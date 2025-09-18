"use client";
import { useQueryClient } from "@tanstack/react-query";

import { Footer } from "@/components/landing-page/Footer";
import {
  fetchArticlesQuery,
  getBlogPostWithRelatedQuery,
  useHealthCheckQuery,
} from "@/lib/queries";
import { useRouter } from "next/navigation";
import { Header } from "@/components/landing-page/Header";
import { customDate } from "@/lib/utils/helpers";
import BlogCard, { BlogCardSkeleton } from "@/components/landing-page/BlogCard";

const Blog = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = fetchArticlesQuery();
  const { error } = useHealthCheckQuery();

  const handleNavigate = (items: Article) => {
    router.push(
      `/blog/${items.id}/${items.title}`
      // TODO: PASS STATE THE RIGHT WAY
      //     , {
      //   state: {
      //     id: items.id || "",
      //     status: items.status || "",
      //     summary: items.summary || "",
      //     subtitle: items.subtitle || "",
      //     blog_cover: items.blog_cover || "",
      //     author_comment: items.author_comment || "",
      //     big_thumbnail: items.big_thumbnail || "",
      //     updatedAt: items.createdAt || "",
      //     title: items.title || "",
      //     description_html: items.description_html || "",
      //     author_avatar: items.author_avatar || "",
      //     author_name: items.author_name || "",
      //     blog_content: items.description_html || "",
      //   },
      // }
    );
  };

  const preFetch = async (id: string) => {
    if (!id) return;

    try {
      await queryClient.prefetchQuery({
        queryKey: ["getBlogPostWithRelated", id],
        queryFn: () => getBlogPostWithRelatedQuery(id),
        // staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      });
    } catch (error) {
      console.error("Prefetch failed for:", id, error);
    }
  };
  if (error) console.error("[HealthCheck] Failed:", error);
  return (
    <section className="space-y-12">
      <Header />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-4xl font-semibold font-poppins">
            Blog
          </h1>
          <p className="text-muted-foreground">
            Last updated: {customDate({ input: new Date() })}
          </p>
        </div>
      </div>
      <main className="max-w-screen-xl mx-auto px-4 sm:px-8 pb-16">
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <BlogCardSkeleton key={idx} />
              ))
            : data?.documents
                ?.filter((item) => item.data.status === "publish")
                .map((item) => {
                  const article = { ...item.data, id: item.id };
                  return (
                    <BlogCard
                      key={item.id}
                      items={article}
                      handleNavigate={handleNavigate}
                      onHover={preFetch}
                    />
                  );
                })}
        </section>
      </main>
      <Footer />
    </section>
  );
};

export default Blog;
