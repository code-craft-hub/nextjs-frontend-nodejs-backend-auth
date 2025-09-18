"use client";

import { ChevronLeft } from "lucide-react";
import { Article } from "@/types";
import { isEmpty } from "lodash";
import { useParams, useRouter } from "next/navigation";
import { getBlogPostWithRelatedQuery } from "@/lib/queries";
import Footer from "@/components/landing-page/Footer";
import Link from "next/link";
import Header from "@/components/landing-page/Header";
import { formatFirestoreRelative } from "@/lib/utils/helpers";
const BlogDetails = () => {
  const params = useParams();
  const location = {state: {}} // TODO:  fix latter
  let state = location.state as Article;
  const { data } = getBlogPostWithRelatedQuery(params?.id!);
  const navigate = useRouter();
  
  const relatedBlog: Article[] = (data?.related || state.related) as Article[];
  const handleNavigate = (items: Article) => {
    router.push(`/blog/${items.id}`, {
      state: {
        id: items.id || "",
        status: items.status || "",
        summary: items.summary || "",
        subtitle: items.subtitle || "",
        blog_cover: items.blog_cover || "",
        author_comment: items.author_comment || "",
        big_thumbnail: items.big_thumbnail || "",
        updatedAt: items.createdAt || "",
        title: items.title || "",
        description_html: items.description_html || "",
        author_avatar: items.author_avatar || "",
        author_name: items.author_name || "",
        blog_content: items.description_html || "",
      },
    });
  };

  return (
    <section>
      <Header />
      <section className="max-w-screen-md mx-auto px-4 sm:px-8 space-y-4 pb-16">
        <Link href="/blog" className="flex items-center text-xs text-blue-500">
          <ChevronLeft className="size-4" />
          Back
        </Link>
        <div className="space-y-2 ">
          <h1 className="font-semibold font-poppins text-xl ">
            {(data?.main.title || state?.title) ?? ""}
          </h1>
          <p className="font-medium text-muted-text text-xs">
            {formatFirestoreRelative(data?.main.createdAt || state?.createdAt)} ' 7 min read
          </p>
        </div>
        <div className="relative mx-auto w-full aspect-auto h-96 overflow-hidden rounded-2xl">
          <img
            src={(data?.main.big_thumbnail || state?.big_thumbnail) ?? ""}
            alt={
              (data?.main.big_thumbnail || state?.big_thumbnail) ?? "Blog cover"
            }
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-in-out hover:scale-110"
          />
        </div>
        <div className="">
          <div className="flex gap-2 items-center">
            <img
              src={
                data?.main.author_avatar ||
                state?.author_avatar ||
                "/assets/default-avatar.png"
              }
              alt={
                data?.main.author_avatar ||
                state?.author_avatar ||
                "Author avatar"
              }
              className="w-8 h-8 rounded-full object-cover"
            />
            <p className="text-sm font-bold">
              {data?.main.author_name || state?.author_name || "James Williams"}
            </p>
          </div>
        </div>
        <div className="font-poppins text-xl font-medium">
          {data?.main.subtitle || state?.subtitle || ""}
        </div>
        <main className="">
          <div
            className="prose"
            dangerouslySetInnerHTML={{
              __html:
                data?.main.description_html || state?.description_html || "",
            }}
          />
        </main>

 {/* // className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-img:rounded-xl prose-img:shadow-md prose-a:text-blue-600 hover:prose-a:underline prose-strong:font-semibold dark:prose-invert" */}
           
        <section>
          {!isEmpty(relatedBlog) && (
            <main className="space-y-4 mb-4 mt-16">
              <h1 className="font-bold text-3xl">Keep reading</h1>

              {relatedBlog?.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-center"
                  onClick={() => handleNavigate(item)}
                >
                  <div className="w-64 h-32 flex-shrink-0 overflow-hidden rounded-lg relative">
                    <img
                      src={item.big_thumbnail || ""}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-in-out hover:scale-110"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h1 className="font-bold line-clamp-2 text-sm leading-tight">
                      {item.title || ""}
                    </h1>
                    <p className="line-clamp-2 text-gray-600">
                      {item.summary || ""}
                    </p>
                  </div>
                </div>
              ))}
            </main>
          )}
          <main
            className="bg-[#DDDDDD] flex items-center
          gap-4 max-w-md p-8 mx-auto mt-16 rounded-md"
          >
            <div className="rounded-full overflow-hidden size-20 shrink-0">
              <img
                src={data?.main.author_avatar || state?.author_avatar || ""}
                alt=""
                loading="lazy"
              />
            </div>
            <div className="space-y-2">
              <h2 className="font-merriweather font-bold text-xl">
                Written by {data?.main.author_name || state?.author_name || ""}{" "}
              </h2>
              <p className="line-clamp-3 ">
                {data?.main.author_comment || state?.author_comment || ""}
              </p>
            </div>
          </main>
        </section>
      </section>
      <Footer />
    </section>
  );
};

export default BlogDetails;
