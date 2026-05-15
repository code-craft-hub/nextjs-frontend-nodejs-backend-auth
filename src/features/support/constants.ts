import {
  Book,
  Bot,
  Briefcase,
  CreditCard,
  FileText,
  Headphones,
  Mail,
  MessageCircle,
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

export type TopicArticle = {
  title: string;
  body: string;
};

export type SupportTopic = {
  title: string;
  desc: string;
  count: number;
  icon: LucideIcon;
  tint: string;
  href: string;
  overview: string;
  articles: TopicArticle[];
};

export const SUPPORT_TOPICS: SupportTopic[] = [
  {
    title: "Getting started",
    desc: "Set up your profile, upload your CV, connect Gmail.",
    count: 18,
    icon: Sparkles,
    tint: "bg-[#EEF3FF] text-[#4680EE]",
    href: "/support/topics/getting-started",
    overview:
      "Get up and running in under 5 minutes. Create your account, upload your CV once, and Cver AI handles the rest — tailoring documents and applying to jobs on your behalf.",
    articles: [
      {
        title: "Create your account",
        body: "Sign up with your email or Google account at cverai.com/register. No credit card needed — the Free plan is available immediately after verification.",
      },
      {
        title: "Upload your CV",
        body: "Go to Dashboard → Profile and upload your existing CV (PDF or Word). Our AI parses your experience, skills, and education automatically so you don't have to fill forms manually.",
      },
      {
        title: "Complete your profile",
        body: "Add your preferred job title, location, work authorisation status, salary expectations, and LinkedIn URL. The richer your profile, the more accurately the AI fills application forms.",
      },
      {
        title: "Connect Gmail (optional)",
        body: "Go to Settings → Integrations and connect your Gmail account. This allows Cver AI to send personalised recruiter emails directly from your address for jobs that don't have an online portal.",
      },
      {
        title: "Install the Chrome extension",
        body: "Download the Cver AI Chrome extension from the Chrome Web Store. Once installed, an Auto Apply button appears on supported job sites — click it and the AI takes over.",
      },
      {
        title: "Make your first tailored document",
        body: "Click Tailor CV from the dashboard, paste a job link or description, and hit Generate. The AI rewrites your bullet points to match the role in about 20 seconds. Review every change before exporting.",
      },
    ],
  },
  {
    title: "AI Apply",
    desc: "How auto‑apply, credits, and recruiter emails work.",
    count: 24,
    icon: Bot,
    tint: "bg-[#F0FAF6] text-[#388B12]",
    href: "/support/topics/ai-apply",
    overview:
      "AI Apply automates the entire job application process — opening the job page, filling every form field, uploading a tailored CV, and submitting. It works across hundreds of ATS platforms and company career sites.",
    articles: [
      {
        title: "How AI Apply works",
        body: "When you click Auto Apply on a job, Cver AI opens the application page in a background browser tab, reads every form field, maps them to your profile, fills them intelligently, and submits — all without you lifting a finger.",
      },
      {
        title: "Supported job boards & ATS portals",
        body: "AI Apply works on LinkedIn Easy Apply, Indeed, Wellfound, and most ATS portals including Greenhouse, Lever, Workday, Ashby, iCIMS, SmartRecruiters, BambooHR, Taleo, and Rippling. For unsupported portals, Cver AI sends a tailored recruiter email instead.",
      },
      {
        title: "How credits work",
        body: "Each successful application costs 1 credit. Pro users get 40 credits per month — they reset on your billing date and do not roll over. Credits are never charged for failed or blocked applications. You can purchase top-up credit packs separately; these never expire.",
      },
      {
        title: "WhatsApp auto-apply",
        body: "Pro users can forward any job link or screenshot to the Cver AI WhatsApp number. Our AI extracts the job details, tailors your CV, and applies automatically — you get a confirmation message when it's done.",
      },
      {
        title: "What happens when an application fails?",
        body: "If AI Apply can't complete a submission (e.g. the listing is closed, requires an assessment, or asks a question it can't answer), no credit is charged. You'll see the exact reason in your Applications log on the dashboard.",
      },
      {
        title: "Reviewing submitted applications",
        body: "Every application is logged under Dashboard → Applications with the job title, company, date, status, and a summary of the fields that were filled. You can approve before final submit if you enable the Review before submit option in Settings.",
      },
    ],
  },
  {
    title: "Resume & cover letters",
    desc: "Tailoring, templates, importing your existing CV.",
    count: 22,
    icon: FileText,
    tint: "bg-[#FFF4E8] text-[#FA8F21]",
    href: "/support/topics/resume",
    overview:
      "Cver AI rewrites your CV and cover letter for every specific role using recruiter insights. Free users get 10 tailored documents per month; Pro users get unlimited.",
    articles: [
      {
        title: "How to tailor your CV",
        body: "Go to Dashboard → Tailor CV, paste a job link or description, and upload your base CV. The AI rewrites bullet points to emphasise skills and experiences most relevant to that role. Review every change in the side-by-side diff before downloading.",
      },
      {
        title: "Generating a cover letter",
        body: "On the same tailoring screen, toggle Generate cover letter. Cver AI writes a 3–4 paragraph, role-specific letter in your name — no generic templates. You can edit any section before exporting.",
      },
      {
        title: "Importing your existing CV",
        body: "Upload PDF, DOCX, or plain-text files. The parser extracts work experience, education, skills, and contact details. If any section is misread, you can correct it directly in Profile → Edit.",
      },
      {
        title: "Export formats",
        body: "Download your tailored CV as a clean, recruiter-ready PDF. The layout is ATS-optimised — no tables, columns, or graphics that scanners choke on.",
      },
      {
        title: "How many documents can I generate?",
        body: "Free plan: 10 tailored documents per month (resumes + cover letters combined). Pro plan: unlimited. The counter resets on the 1st of each month.",
      },
      {
        title: "Tailoring quality tips",
        body: "The richer your base profile (detailed job responsibilities, quantified achievements, full skills list), the better the tailored output. Add at least 3 bullet points per role and include a skills section for best results.",
      },
    ],
  },
  {
    title: "Job board & WhatsApp",
    desc: "Recommendations, forwarding job links, alerts.",
    count: 16,
    icon: Briefcase,
    tint: "bg-[#EEF2FF] text-[#4640DE]",
    href: "/support/topics/jobs",
    overview:
      "Cver AI curates a personalised job board updated daily based on your profile, skills, and preferred location. Pro users also receive WhatsApp alerts and can apply to any job by simply forwarding a link.",
    articles: [
      {
        title: "How job recommendations work",
        body: "Our AI matches open roles against your profile — job title, skills, location, work authorisation, and salary range. Listings are ranked by relevance and refreshed every day. Set your preferences in Profile → Job Preferences to improve matches.",
      },
      {
        title: "Filtering the job board",
        body: "Use the filters on Dashboard → Jobs to narrow by job type (remote, hybrid, on-site), location, sponsorship availability, salary range, and date posted. Save filter presets to reuse across sessions.",
      },
      {
        title: "WhatsApp job alerts (Pro)",
        body: "Pro users receive a daily WhatsApp digest of the top matching jobs. You can reply with a number to auto-apply to that listing immediately — no need to open the app.",
      },
      {
        title: "Forwarding a job link via WhatsApp",
        body: "Send any job URL or screenshot to the Cver AI WhatsApp number. The AI reads the listing, tailors your documents, and applies. You receive a confirmation once submitted, including which fields were filled.",
      },
      {
        title: "Bookmarking jobs",
        body: "Click the bookmark icon on any job card to save it for later. Bookmarked jobs appear under Dashboard → Saved Jobs and are never removed until you unsave them.",
      },
      {
        title: "Asking questions on WhatsApp",
        body: "You can chat with Cver AI directly on WhatsApp — ask about your application status, request a tailored CV for a specific role, or ask for interview tips. The assistant has full context of your profile and past applications.",
      },
    ],
  },
  {
    title: "Billing & plans",
    desc: "Free vs Pro, credits, invoices, refunds.",
    count: 14,
    icon: CreditCard,
    tint: "bg-[#FDECEC] text-[#D14343]",
    href: "/support/topics/billing",
    overview:
      "Cver AI offers a Free plan for occasional use and a Pro plan at ₦4,999/month for serious job seekers. Manage everything — upgrades, pauses, invoices, and refunds — from Account → Billing.",
    articles: [
      {
        title: "Free vs Pro — what's included",
        body: "Free: 10 tailored documents/month, job board access, resume & cover letter tools. Pro (₦4,999/month): unlimited tailored documents, 40 auto-apply credits/month, WhatsApp auto-apply, daily job recommendations, and priority support.",
      },
      {
        title: "How to upgrade to Pro",
        body: "Go to Account → Billing → Upgrade. Pay securely via Paystack using your debit/credit card. Your Pro features activate immediately after payment confirmation.",
      },
      {
        title: "What happens to unused credits?",
        body: "The 40 monthly AI Apply credits reset on your billing date and do not roll over. We notify you 3 days before reset. Top-up credit packs purchased separately never expire.",
      },
      {
        title: "Pausing your subscription",
        body: "Go to Account → Billing → Manage plan → Pause. You can pause for up to 60 days — your Pro features remain active during the pause period and you won't be charged again until you resume.",
      },
      {
        title: "Cancelling your subscription",
        body: "Cancel anytime from Account → Billing → Manage plan → Cancel. You keep Pro access until the end of your current billing period and won't be charged again. Your data and profile are retained.",
      },
      {
        title: "Refund policy",
        body: "If you're charged in error or experience a confirmed technical failure on our side, contact hello@cverai.com with your transaction reference. Refunds are processed within 3–5 business days to the original payment method.",
      },
    ],
  },
  {
    title: "Account & security",
    desc: "Password, 2FA, deleting your account, data.",
    count: 11,
    icon: Shield,
    tint: "bg-[#F1ECFD] text-[#7E5BEF]",
    href: "/support/topics/account",
    overview:
      "Manage your login credentials, connected services, privacy settings, and account data from the Account section. Your data is stored encrypted and never sold to third parties.",
    articles: [
      {
        title: "Changing your password",
        body: "Go to Account → Security → Change password. Enter your current password and your new password (min. 8 characters). If you've forgotten your password, use the Forgot password link on the login page — a reset link is emailed to you.",
      },
      {
        title: "Connected accounts (Gmail / Google)",
        body: "Go to Account → Integrations to see which services are connected. You can disconnect Gmail at any time — this stops Cver AI from sending recruiter emails on your behalf but doesn't affect other features.",
      },
      {
        title: "Downloading your data",
        body: "Go to Account → Privacy → Download my data. You'll receive a ZIP file containing your profile, CV uploads, tailored documents, and application history within 24 hours.",
      },
      {
        title: "Deleting your account",
        body: "Go to Account → Privacy → Delete account. This permanently removes your profile, all documents, application history, and cancels any active subscription. This action cannot be undone.",
      },
      {
        title: "How your data is stored",
        body: "Your CV and documents are stored encrypted at rest. We never share your personal data with employers or third parties without your explicit action (e.g. submitting an application). See our Privacy Policy for full details.",
      },
      {
        title: "Logging out of all devices",
        body: "Go to Account → Security → Sessions to see all active login sessions. Click Sign out all devices to invalidate every session except the current one — useful if you suspect unauthorised access.",
      },
    ],
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
