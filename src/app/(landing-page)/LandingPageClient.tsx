"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import "./glass.css";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/landing-page/Footer";
import {
  actionButtons,
  coreFeatures,
  faqItems,
  howItWorks,
  testimonials,
} from "./constants";
import { Header } from "./components/Header";
import { LandingPageInput } from "./components/LandingPageInput";
import { ActionButton } from "./components/ActionButton";
import { MeetCverai } from "./components/MeetCverai";
import { FeatureJobs } from "./components/FeatureJobs";
import { IUser } from "@/shared/types";
import Pricing from "./components/Pricing";
import { VideoModal } from "./components/VideoModal";
import { useRouter } from "next/navigation";
import { blogQueries } from "@/features/blog/queries/blog.queries";
import {
  BlogCard,
  BlogCardSkeleton,
} from "@/features/blog/components/homeComponents/BlogCard";

export const LandingPageClient = ({
  user,
}: {
  user: Partial<IUser> | null;
}) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const router = useRouter();

  // Fetch real blogs - limit to 3 for landing page
  const { data: blogsData, isLoading: blogsLoading } = useQuery(
    blogQueries.list({ limit: 3, status: "publish" }),
  );
  const blogs = blogsData?.items ?? [];
  return (
    <div className="min-h-screen bg-white font-poppins">
      <section
        id="home"
        style={{
          background: "url('/landing-page-menu-gradient.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        <Header user={user} />
        <div className="pt-32 mx-auto">
          <h1 className="text-4xl text-center font-medium s:text-red-900 mb-12 font-instrument!">
            AI Assist To Apply
          </h1>
        </div>
      </section>
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 pb-20 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-row items-center justify-center mx-auto gap-4">
            {actionButtons.map((option) => (
              <ActionButton key={option.name} option={option} />
            ))}
          </div>
          <div className="text-center mx-auto">
            {/* Search Bar */}
            <div className=" mb-16">
              <div className="flex-1 relative ">
                <LandingPageInput />
              </div>
            </div>

            {/* How it works */}
            <div className="">
              <h2 className="text-2xl font-bold text-gray-900 mb-12">
                How it works?
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                {howItWorks.map((item) => (
                  <div className="text-center" key={item.title}>
                    <div
                      className={cn(
                        "w-16 h-16 mx-auto mb-10 shadow-2xl rounded-2xl flex items-center justify-center",
                        item.color,
                      )}
                    >
                      <img src={item.icons} alt={item.title} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <ul className="">
                      {item.list1 && (
                        <li className="text-gray-600 text-sm">{item.list1}</li>
                      )}
                      {item.list2 && (
                        <li className="text-gray-600 text-sm">{item.list2}</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className=" px-4 bg-geen-500">
        <VideoModal />
      </div>

      <FeatureJobs />

      {/* Core Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <img
              src="/core-features.png"
              alt="Core Features"
              className="hidden md:grid"
            />
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Core Features
              </h2>
              <div className="space-y-6">
                {coreFeatures.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex items-start space-x-4 sm:space-x-8"
                  >
                    <div className="size-20 shrink-0 bg-[#F1F6FF] rounded-xl flex items-center justify-center">
                      <img src={feature.icon} alt="" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <MeetCverai />
      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={item.question} className="bg-[#F8F8F8] rounded-2xl">
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === index ? null : index)
                  }
                  className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors"
                >
                  <span className="font-poppins text-[#030712]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedFaq === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20">
        <Pricing />
      </section>
      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-50"
        style={{
          background: 'url("/testimonial-section.png") ',
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "top",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              What people say
            </h2>
            <p className="text-gray-600">
              Join thousands of professionals who found their dream jobs
            </p>
          </div>

          <div className="flex flex-col max-sm:flex-wrap md:flex-row gap-8 mx-auto items-center justify-center">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.company}
                className={`${
                  index % 2 === 0 && "sm:mt-16"
                } bg-white rounded-2xl p-6 shadow-2xl shadow-blue-100 h-fit space-y-4 w-75`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl mr-4">
                    <img src={testimonial.avatar} alt={testimonial.name} />
                  </div>
                </div>

                <p className="text-gray-600">{testimonial.content}</p>

                <div className="flex items-center gap-2 text-nowrap">
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id={"blog"} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="mb-6 md:col-span-2">
              <h2 className="text-xl text-gray-900 ">Blog</h2>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Stay updated with the latest products and career tips.
              </h2>
            </div>
            <div className="">
              <p className="text-xs">
                Don&#39;t miss out—get the latest job updates and blog insights!
              </p>
              <button
                onClick={() => router.push("/blog")}
                className="flex gap-2 items-center mt-1 text-blue-500 text-[12px] hover:underline"
              >
                <p>See more posts</p>
                <ChevronRight className="size-3" />
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {blogsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))
              : blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};
