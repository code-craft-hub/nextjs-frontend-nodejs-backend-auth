"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import "./glass.css";
import {
  MapPin,
  ChevronDown,
  Menu,
  ArrowRight,
  Plus,
  ArrowUp,
  Bookmark,
  ChevronRight,
  Mail,
  Home,
  Store,
  CreditCard,
  FileQuestionMark,
  Newspaper,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useUserLocation } from "@/hooks/get-user-location";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/landing-page/Footer";

export const LandingPageClient = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { flag } = useUserLocation();
  const featuredJobs = [
    {
      title: "Product Manager",
      company: "Tech Corp",
      location: "Remote",
      salary: "$120k - $150k",
      type: "Full-time",
      logo: "🏢",
    },
    {
      title: "Senior Developer",
      company: "StartupXYZ",
      location: "New York",
      salary: "$100k - $130k",
      type: "Full-time",
      logo: "💻",
    },
    {
      title: "UX Designer",
      company: "Design Studio",
      location: "San Francisco",
      salary: "$90k - $120k",
      type: "Contract",
      logo: "🎨",
    },
    {
      title: "Data Analyst",
      company: "Data Inc",
      location: "Chicago",
      salary: "$80k - $110k",
      type: "Full-time",
      logo: "📊",
    },
    {
      title: "Marketing Manager",
      company: "Growth Co",
      location: "Austin",
      salary: "$85k - $115k",
      type: "Full-time",
      logo: "📈",
    },
    {
      title: "DevOps Engineer",
      company: "Cloud Systems",
      location: "Seattle",
      salary: "$110k - $140k",
      type: "Full-time",
      logo: "☁️",
    },
  ];

  const testimonials = [
    {
      name: "Chinelo A.",
      role: "Marketer",
      company: "TechCorp",
      avatar: "/marketer.png",
      content: "“More Call backs in 2 weeks than 2 months”",
    },
    {
      name: "Tobi M.",
      role: "Admin",
      company: "StartupXYZ",
      avatar: "/tobi.png",
      content: "“Now, I just prep for interviews”",
    },

    {
      name: "Edward A.",
      role: "Engineer",
      company: "Google",
      avatar: "/marketer.png",
      content: "“More Call backs in 2 weeks than 2 months”",
    },
  ];
  const blogs = [
    {
      title: "Resume",
      heading: "Tips and tricks to craft a  stand-out",
      image: "/resume.png",
      content: "resume that grabs attention fast.",
    },
    {
      title: "Interview",
      heading:
        "How to prepare, respond, and leave a lasting impression during interviews.",
      image: "/interview.png",
      content: "resume that grabs attention fast.",
    },
    {
      title: "Growth",
      heading:
        "Strategies to level up your career and develop in-demand skills",
      image: "/growth.png",
      content: "resume that grabs attention fast.",
    },
  ];

  const faqItems = [
    {
      question: "What is AI Assist?",
      answer:
        "AI Assist is our intelligent job matching system that analyzes your skills, experience, and preferences to recommend the most relevant job opportunities.",
    },
    {
      question: "How do I use it?",
      answer:
        "Simply create your profile, upload your resume, and start applying to jobs with one click. Our system streamlines the entire application process.",
    },
    {
      question: "Can it apply to any job?",
      answer:
        "Our AI is designed to handle a wide range of job applications across various industries and platforms, including LinkedIn, Telegram, WhatsApp, and more.",
    },
    {
      question: "What's included in resume tailoring?",
      answer:
        "Resume tailoring involves customizing your resume and cover letter to align with the specific job description, highlighting relevant skills and experiences to increase your chances of getting noticed by recruiters.",
    },
    {
      question: "How does the job board work?",
      answer:
        "Our job board curates listings based on your profile, skills, and preferences, providing you with daily updates on the most relevant opportunities.",
    },
  ];

  const howItWorks = [
    {
      title: "Find a job you like",
      list1:
        "Seen a great opportunity on Telegram, LinkedIn, Indeed, or WhatsApp?",
      list2: "Share a job link, screenshot, or text description.",
      color: "bg-[#9672FF]",
      icons: "/search-white.svg",
    },
    {
      title: "AI Handles the Application",
      list1:
        "The system fills forms, uploads tailored CVs and cover letters, and auto-emails the recruiter.",
      color: "bg-[#4DDFFD]",
      icons: "/ai-handle.svg",
    },
    {
      title: "Stay Updated via WhatsApp",
      list1: "Get personalized job recs and updates.",
      list2: "Ask quick questions right inside WhatsApp.",
      color: "bg-[#F2B8EC]",
      icons: "/whatsapp-update.svg",
    },
  ];

  const coreFeatures = [
    {
      title: "AI Apply",
      description:
        "Our AI-powered job apply tool automates the entire process—filling forms, sending emails, and handling portals in seconds for truly automatic job applications.",
      icon: "/favorite-chart.svg",
    },
    {
      title: "Document Tailoring",
      description:
        "Get resumes and cover letters tailored with precision. Using recruiter insights, our AI resume tailoring engine ensures a personalized CV builder experience for every role.",
      icon: "/presention-chart.svg",
    },
    {
      title: "Smart Job Board",
      description:
        "Find opportunities that matter. Our AI job search engine curates a personalized job board with daily curated listings matched to your profile, skills, and location.",
      icon: "/chart.svg",
    },
  ];

  const creditCard = [
    {
      tier: "Free",
      price: 0,
      features: [
        "10 tailored documents monthly (resume, cover letter, interview questions)",
        "Access to resume, cover letter, and interview tailoring tools",
        "Access to our job board of remote and sponsorship jobs",
        "Great for trying out the platform and preparing occasional job applications",
      ],
    },
    {
      tier: "Pro",
      price: 4999,
      features: [
        "Unlimited tailored resumes, cover letters, and interview questions",
        "40 auto-apply credits per month (apply to jobs in seconds)",
        "WhatsApp auto-apply: forward job posts and get applied instantly",
        "Smart job recommendations delivered daily to your dashboard and WhatsApp",
        "Enhanced access to our job board of remote and sponsorship jobs",
        "Save hours on job applications and increase your chances of landing interviews",
      ],
    },
  ];

  const actionButtons = [
    {
      name: "AI Apply",
      icon: "/ai-apply.svg",
      url: "/",
    },
    {
      name: "Tailor CV",
      icon: "/tailor-cv.svg",
      url: "/",
    },
    {
      name: "Find Jobs",
      icon: "/search.svg",
      url: "/",
    },
  ];

  const navItems = [
    {
      name: "Home",
      url: "",
      icon: <Home />,
    },
    {
      name: "Features",
      url: "",
      icon: <Store />,
    },
    {
      name: "Pricing",
      url: "",
      icon: <CreditCard />,
    },
    {
      name: "FAQ",
      url: "",
      icon: <FileQuestionMark />,
    },
    {
      name: "Blog",
      url: "",
      icon: <Newspaper />,
    },
  ];
  return (
    <div className="min-h-screen bg-white font-poppins">
      <section
        style={{
          background: "url('/landing-page-menu-gradient.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        <header className="fixed w-full top-0 z-50  backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <img src="/logo.svg" alt="" />
              </div>

              <nav className="hidden lg:flex items-center space-x-8">
                {navItems.map((nav) => (
                  <a
                    key={nav.name}
                    href="#"
                    className="font-semibold font-poppins text-black hover:text-gray-900 transition-colors hover:bg-accent px-4 py-2 rounded-xl"
                  >
                    {nav.name}
                  </a>
                ))}
              </nav>
              <div className="hidden lg:flex items-center space-x-4">
                {!!user ? (
                  <Button onClick={() => router.push(`/dashboard`)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg">
                    Dashboard
                  </Button>
                ) : (
                  <Button onClick={() => router.push(`/register`)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg">
                    Get started
                  </Button>
                )}
              </div>

              <Sheet>
                <SheetTrigger asChild className="lg:hidden p-2 rounded-lg">
                  <Button variant="ghost">
                    <Menu size={24} />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[50%]">
                  <SheetTitle className="sr-only">mobile nav</SheetTitle>
                  <div className="flex items-center space-x-2 ml-4 mt-4">
                    <img src="/logo.svg" alt="" />
                  </div>
                  {!!user && (
                    <div className="flex items-center gap-3  p-4">
                      <Avatar className="size-10">
                        <AvatarImage
                          src={user?.photoURL as string}
                          alt="@avatar"
                        />
                        <AvatarFallback>
                          {user?.firstName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 max-w-[190px] overflow-hidden">
                          <h3 className="font-semibold text-nowrap overflow-hidden">
                            {user?.firstName} {user?.lastName}
                          </h3>
                          <span className="-mb-2">
                            {flag && (
                              <div className="size-4 shrink-0">
                                <img loading="lazy" src={flag} alt="" />
                              </div>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{user?.email}</span>
                          <Mail className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                        </div>
                      </div>
                    </div>
                  )}
                  <SheetClose className="">
                    {navItems?.map((item) => {
                      return (
                        <div
                          key={item.name}
                          // onClick={() => item.onClick()}
                          className="flex items-center gap-3 p-3 px-4 hover:bg-muted cursor-pointer border-t"
                        >
                          <span className=" font-medium">{item.icon}</span>
                          <span className=" font-medium">{item.name}</span>
                        </div>
                      );
                    })}
                  </SheetClose>

                  <SheetFooter>
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Log in
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                        Get started
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
        <div className="pt-32 mx-auto">
          <h1 className="text-4xl text-center font-semibold s:text-red-900 mb-6 font-instrument">
            AI Assist to Apply
          </h1>
        </div>
      </section>
      <section className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 pb-20 lg:pb-32 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {actionButtons.map((option) => (
              <div key={option.name}>
                <a href="#" className="glass-button !text-black">
                  <img src={option.icon} alt={option.name} className="" />
                  {option.name}
                </a>
              </div>
            ))}
          </div>
          <div className="text-center  mx-auto">
            {/* Search Bar */}
            <div className=" mb-16">
              <div className="flex-1 relative">
                <div
                  className="border-blue-500 border-[1px] w-fit rounded-full p-1 absolute bottom-4 left-3"
                  onClick={() => router.push(`/dashboard`)}
                >
                  <Plus className=" text-blue-400 size-3" />
                </div>
                <textarea
                  placeholder="Let's get started"
                  className="w-full h-36 border p-2 resize-none rounded-2xl pl-4 pt-2  placeholder:font-medium hover:shadow-2xl transition-all duration-500"
                ></textarea>
                <div
                  className="border-blue-500 border-[1px] w-fit rounded-full p-1 absolute bottom-4 right-3 "
                  onClick={() => router.push(`/dashboard`)}
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
      <section className="pb-20">
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
      <section className="py-20">
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
                <Button className=" text-white px-8 py-3">
                  Start now - Your job hunt just got easier!
                </Button>
              </div>
            </div>
            <img src="/job-interview.png" alt="Job Interview" />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
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
      <section className="py-20">
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

      <section className="py-20 bg-gray-50">
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
                Don't miss out—get the latest job updates and blog insights!
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
