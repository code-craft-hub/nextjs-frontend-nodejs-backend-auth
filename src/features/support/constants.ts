import {
  Book,
  Bot,
  Briefcase,
  CreditCard,
  FileText,
  Headphones,
  Mail,
  MessageCircle,
  Settings,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type SupportChannel = {
  title: string;
  desc: string;
  meta: string;
  cta: string;
  icon: LucideIcon;
  bg: string;
  href: string;
};

export const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    title: "WhatsApp",
    desc: "Chat with our team — fastest replies.",
    meta: "Avg. reply 4 min",
    cta: "Open WhatsApp",
    icon: MessageCircle,
    bg: "bg-[#56CDAD]",
    href: "https://wa.me/+436767391022",
  },
  {
    title: "Email us",
    desc: "Write to support — we reply within a day.",
    meta: "hello@cverai.com",
    cta: "Send email",
    icon: Mail,
    bg: "bg-[#4680EE]",
    href: "mailto:hello@cverai.com",
  },
  {
    title: "Live chat",
    desc: "In‑app chat with a real human, weekdays.",
    meta: "Mon–Fri · 9am–6pm WAT",
    cta: "Start a chat",
    icon: Headphones,
    bg: "bg-[#9672FF]",
    href: "#live-chat",
  },
  {
    title: "Help center",
    desc: "Step‑by‑step articles and video walkthroughs.",
    meta: "120+ articles",
    cta: "Browse articles",
    icon: Book,
    bg: "bg-[#FA8F21]",
    href: "#topics",
  },
];

export type SupportTopic = {
  title: string;
  desc: string;
  count: number;
  icon: LucideIcon;
  tint: string;
  href: string;
};

export const SUPPORT_TOPICS: SupportTopic[] = [
  {
    title: "Getting started",
    desc: "Set up your profile, upload your CV, connect Gmail.",
    count: 18,
    icon: Sparkles,
    tint: "bg-[#EEF3FF] text-[#4680EE]",
    href: "/support/topics/getting-started",
  },
  {
    title: "AI Apply",
    desc: "How auto‑apply, credits, and recruiter emails work.",
    count: 24,
    icon: Bot,
    tint: "bg-[#F0FAF6] text-[#388B12]",
    href: "/support/topics/ai-apply",
  },
  {
    title: "Resume & cover letters",
    desc: "Tailoring, templates, importing your existing CV.",
    count: 22,
    icon: FileText,
    tint: "bg-[#FFF4E8] text-[#FA8F21]",
    href: "/support/topics/resume",
  },
  {
    title: "Job board & WhatsApp",
    desc: "Recommendations, forwarding job links, alerts.",
    count: 16,
    icon: Briefcase,
    tint: "bg-[#EEF2FF] text-[#4640DE]",
    href: "/support/topics/jobs",
  },
  {
    title: "Billing & plans",
    desc: "Free vs Pro, credits, invoices, refunds.",
    count: 14,
    icon: CreditCard,
    tint: "bg-[#FDECEC] text-[#D14343]",
    href: "/support/topics/billing",
  },
  {
    title: "Account & security",
    desc: "Password, 2FA, deleting your account, data.",
    count: 11,
    icon: Shield,
    tint: "bg-[#F1ECFD] text-[#7E5BEF]",
    href: "/support/topics/account",
  },
];

export type SupportFaq = {
  cat: string;
  question: string;
  answer: string;
};

export const SUPPORT_FAQS: SupportFaq[] = [
  {
    cat: "Getting started",
    question: "How do I create my first AI‑tailored resume?",
    answer:
      "From the dashboard, click Tailor CV, paste a job link or description, and upload your existing resume. Our AI rewrites bullets to match the role in about 20 seconds — you can review every change before exporting.",
  },
  {
    cat: "AI Apply",
    question: "Can AI Apply submit applications on any job board?",
    answer:
      "AI Apply works on LinkedIn, Indeed, Wellfound, company career pages and most ATS portals (Greenhouse, Lever, Workday, Ashby). For unsupported sites we forward a one‑click tailored email to the recruiter instead.",
  },
  {
    cat: "Billing",
    question: "What happens to unused credits at the end of the month?",
    answer:
      "Pro plan credits reset each billing cycle and do not roll over. We notify you 3 days before reset so you can use anything left. Top‑up credits you purchase separately never expire.",
  },
  {
    cat: "Account",
    question: "How do I cancel or pause my subscription?",
    answer:
      "Go to Account → Billing → Manage plan. You can pause for up to 60 days or cancel immediately — you keep Pro features until the end of the current period and won't be charged again.",
  },
  {
    cat: "Resume",
    question: "Does Cver AI store my resume or share it with recruiters?",
    answer:
      "Your resume is stored encrypted on our servers and is never shared with third parties without your explicit action (e.g. applying to a job). You can delete every document and your account from Account → Privacy at any time.",
  },
  {
    cat: "AI Apply",
    question: "Why did an application fail?",
    answer:
      "Common reasons: the listing was already closed, the portal requires a specific assessment, or it asked a custom question we couldn't auto‑answer. We never charge a credit for a failed application and you'll see the exact reason in your Applications log.",
  },
];

export const SUPPORT_CATEGORIES = [
  "AI Apply",
  "Resume & cover letters",
  "Job board",
  "Billing & plans",
  "Account & security",
  "Something else",
] as const;

export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const SUPPORT_SEARCH_SUGGESTIONS = [
  "reset my password",
  "cancel subscription",
  "how do auto‑apply credits work",
  "import LinkedIn profile",
  "delete my account",
  "refund a payment",
  "WhatsApp not getting alerts",
  "tailor CV for multiple roles",
];
