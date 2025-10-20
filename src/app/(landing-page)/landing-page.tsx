"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import "./glass.css";
import {
  MapPin,
  ChevronDown,
  ArrowRight,
  Plus,
  ArrowUp,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/landing-page/Footer";
import {
  actionButtons,
  blogs,
  coreFeatures,
  creditCard,
  faqItems,
  featuredJobs,
  howItWorks,
  testimonials,
} from "./constants";
import { Header } from "./components/Header";
import Link from "next/link";

export const LandingPageClient = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const router = useRouter();

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
        <Header />
        <div className="pt-32 mx-auto">
          <h1 className="text-4xl text-center font-medium s:text-red-900 mb-16 !font-instrument">
            AI Assist To Apply
          </h1>
        </div>
      </section>
      <section className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 pb-20 lg:pb-32 space-y-8">
          <div className="flex flex-row items-center justify-center mx-auto max-sm:justify-evenly gap-2 sm:gap-4">
            {actionButtons.map((option) => (
              <div key={option.name}>
                <Link
                  href={option.url}
                  className="glass-button !text-black sm:w-32 gap-2 p-3"
                >
                  <img
                    src={option.icon}
                    alt={option.name}
                    className="max-xs4:size-3 size-4"
                  />
                  <span className="max-xs4:text-[0.6rem] text-xs text-nowrap">
                    {option.name}
                  </span>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center  mx-auto">
            {/* Search Bar */}
            <div className=" mb-16">
              <div className="flex-1 relative">
                <div
                  className="border-blue-500 border-[1px] w-fit rounded-full p-1 absolute bottom-4 left-3"
                  onClick={() => router.push(`/dashboard/ai-apply`)}
                >
                  <Plus className=" text-blue-400 size-3" />
                </div>
                <textarea
                  placeholder="Let's get started"
                  className="w-full h-36 border p-2 resize-none rounded-2xl pl-4 pt-2  placeholder:font-medium shadow-xl shadow-blue-100 transition-all duration-500"
                ></textarea>
                <div
                  className="border-blue-500 border-[1px] w-fit rounded-full p-1 absolute bottom-4 right-3 "
                  onClick={() => router.push(`/dashboard/ai-apply`)}
                >
                  <ArrowUp className=" text-blue-400 size-3 " />
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="">
              <h2 className="text-2xl font-bold text-gray-900 mb-12">
                How it works?
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                {howItWorks.map((item) => (
                  <div className="text-center " key={item.title}>
                    <div
                      className={cn(
                        "w-16 h-16 mx-auto mb-4 shadow-2xl rounded-2xl flex items-center justify-center",
                        item.color
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

      {/* Featured Jobs */}
      <section id="feature-jobs" className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Jobs</h2>
            <Button
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4 space-y-4"
              >
                <div className="">
                  <h3 className="font-semibold  mb-1">{job.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 uppercase text-nowrap h-fit">
                    {job.type}
                  </span>
                  <span className=" text-gray-400 text-xs">
                    Salary: {job.salary}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-2xl">
                    {job.logo}
                  </div>
                  <div className="">
                    <p className="text-gray-600 text-sm">{job.company}</p>
                    <div className="flex items-center text-gray-500 text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      {job.location}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <Bookmark className="size-4 text-gray-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Mobile App Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Meet AI Apply - <br />
                Apply for Jobs in Seconds.
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Streamline your job search with AI-powered applications across
                LinkedIn, Telegram, WhatsApp, and more platforms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="max-sm:text-2xs break-words text-white px-8 py-3">
                  Start now - Your job hunt just got easier!
                </Button>
              </div>
            </div>
            <img src="/job-interview.png" alt="Job Interview" />
          </div>
        </div>
      </section>

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
                  <span className="font-semibold text-gray-900">
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Pricing
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Choose a plan that suits your needs best!
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {creditCard.map((plan) => (
              <div
                key={plan.tier}
                className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col justify-between"
              >
                <div className="">
                  <div className=" mb-8">
                    <h3 className="text-2xl  text-gray-900 mb-2">
                      {plan.tier} Tier
                    </h3>
                    <div className="flex items-baseline  mb-4">
                      <p className="text-5xl  text-gray-900">
                        {plan.price?.toLocaleString("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          minimumFractionDigits: 0,
                        })}
                        <span className="text-gray-400 text-[14px]">
                          / month
                        </span>
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-4 px-8 mb-8 list-disc ">
                    {plan.features.map((feature) => (
                      <li key={feature} className=" items-center text-black ">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant="outline"
                  className="bg-primary/10 hover:bg-primary/30 !h-12 text-blue-500 hover:text-blue-500"
                >
                  Choose this plan
                </Button>
              </div>
            ))}
          </div>
        </div>
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

          <div className="flex flex-col sm:flex-row gap-8 mx-auto items-center justify-center">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.company}
                className={`${
                  index % 2 === 0 && "sm:mt-16"
                } bg-white rounded-2xl p-6 shadow-2xl h-fit space-y-4 w-[300px]`}
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
              <div className="flex gap-2 items-center mt-1">
                <p className="text-blue-500 text-[12px]">See more posts</p>
                <ChevronRight className="size-3" />
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article className="space-y-4 " key={blog.title}>
                <div className="relative h-40 w-full rounded-2xl overflow-hidden">
                  <img
                    src={blog.image}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    alt={blog.title}
                  />
                </div>

                <div className="">
                  <span className="text-[#667085] text-xs font-semibold tracking-wide">
                    {blog.title}
                  </span>
                  <h3 className="text-gray-900 mt-2 mb-3">{blog.heading}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};
