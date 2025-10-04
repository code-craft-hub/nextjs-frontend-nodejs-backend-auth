import {
  Home,
  Store,
  CreditCard,
  FileQuestionMark,
  Newspaper,
} from "lucide-react";
export const navItems = [
  {
    name: "Home",
    url: "#home",
    icon: <Home />,
  },
  {
    name: "Features",
    url: "#features",
    icon: <Store />,
  },
  {
    name: "Pricing",
    url: "#pricing",
    icon: <CreditCard />,
  },
  {
    name: "FAQ",
    url: "#faq",
    icon: <FileQuestionMark />,
  },
  {
    name: "Blog",
    url: "#blog",
    icon: <Newspaper />,
  },
];

export const featuredJobs = [
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

export const testimonials = [
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
export const blogs = [
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
    heading: "Strategies to level up your career and develop in-demand skills",
    image: "/growth.png",
    content: "resume that grabs attention fast.",
  },
];

export const faqItems = [
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

export const howItWorks = [
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
    icons: "/ai-hands.svg",
  },
  {
    title: "Stay Updated via WhatsApp",
    list1: "Get personalized job recs and updates.",
    list2: "Ask quick questions right inside WhatsApp.",
    color: "bg-[#F2B8EC]",
    icons: "/whatsapp-update.svg",
  },
];

export const coreFeatures = [
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

export const creditCard = [
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

export const actionButtons = [
  {
    name: "AI Apply",
    icon: "/ai-apply.svg",
    url: "/dashboard/home",
  },
  {
    name: "Tailor CV",
    icon: "/tailor-cv.svg",
    url: "/dashboard/home",
  },
  {
    name: "Find Jobs",
    icon: "/search.svg",
    url: "/dashboard/home",
  },
];
