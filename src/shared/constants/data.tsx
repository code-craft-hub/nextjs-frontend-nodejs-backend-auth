import { Mail, MapPin, Plus } from "lucide-react";

// Inline SVGs for brand icons — avoids loading entire react-icons fa/bi/fi
// bundles (~672 KiB) on every page that imports Footer.
const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YouTubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);

// social
export const social = [
  {
    icon: <FacebookIcon />,
    href: "https://www.facebook.com/cverai",
  },
  {
    icon: <TwitterIcon />,
    href: "",
  },
  {
    icon: <LinkedInIcon />,
    href: "https://www.linkedin.com/company/cver-ai",
  },
  {
    icon: <InstagramIcon />,
    href: "https://www.instagram.com/cver_ai",
  },
  {
    icon: <YouTubeIcon />,
    href: "https://www.youtube.com/@cverai",
  },
];

// services
export const services = [
  {
    icon: <Plus size={16} />,
    name: "What is an AI Resume Builder?",
  },
  {
    icon: <Plus size={16} />,
    name: "How does the AI Resume Builder work?",
  },
  {
    icon: <Plus size={16} />,
    name: "Is my data safe and secure?",
  },
  {
    icon: <Plus size={16} />,
    name: "Can I edit the generated resume?",
  },
  {
    icon: <Plus size={16} />,
    name: "Can I use the AI Resume Builder for multiple job applications?",
  },
  {
    icon: <Plus size={16} />,
    name: "Is there a cost to use the AI Resume Builder?",
  },
];

// contact
export const contact = [
  {
    icon: <Mail size={20} />,
    title: "Have a question?",
    subtitle: "I am here to help you.",
    description: "Email me at hello@youremail.com",
  },
  {
    icon: <MapPin size={20} />,
    title: "Current Location",
    subtitle: "Bucharest, Romania",
    description: "Serving clients worldwide",
  },
];

export const creditCard = [
  {
    amount: "Free",
    credit: "Daily 5 Credits",
    builder: "Resume Builder",
    limit: "Cover Letter Generator",
  },
  {
    amount: "1000",
    sub: "/daily",
    title: "Daily",
    credit: "Cover Letter Generator",
    builder: "Interview Question Generator",
    limit: "Unlimited Access for a day",
  },
  {
    amount: "5000",
    sub: "/weekly",
    title: "Weekly",
    credit: "Cover Letter Generator",
    builder: "Interview Question Generator",
    limit: "Unlimited Access for a week",
  },
  {
    amount: "15000",
    sub: "/monthly",
    title: "Monthly",
    credit: "Cover Letter Generator",
    builder: "Interview Question Generator",
    limit: "Unlimited Access for a week",
  },
];

export const defaultResumeFormData = {
  profile:
    "Experienced software engineer with a passion for building scalable applications.",
  education: [
    {
      educationId: crypto.randomUUID(),
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      schoolName: "Stanford University",
      educationStart: "2015-09",
      educationEnd: "2019-06",
      schoolLocation: "Stanford, CA",
    },
  ],
  workExperience: [
    {
      workExperienceId: crypto.randomUUID(),
      jobTitle: "Senior Software Engineer",
      companyName: "Tech Corp",
      location: "San Francisco, CA",
      jobStart: "2019-07",
      jobEnd: "2024-01",
      responsibilities: [
        "Developed responsive UI using React",
        "Collaborated with backend team to integrate APIs",
      ],
    },
  ],
  certification: [
    {
      certificationId: crypto.randomUUID(),
      title: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      issueDate: "2022-03",
      expiryDate: "2025-03",
      description: "Professional certification in cloud architecture",
    },
  ],
  project: [
    {
      projectId: crypto.randomUUID(),
      name: "E-Commerce Platform",
      description: "Built a scalable e-commerce platform serving 1M+ users",
      techStack: ["Next.js", "Node.js", "PostgreSQL"],
      role: "Lead Developer",
    },
  ],
  softSkill: [
    { label: "Communication", value: "communication" },
    { label: "Leadership", value: "leadership" },
  ],
  hardSkill: [
    { label: "React", value: "react" },
    { label: "TypeScript", value: "typescript" },
  ],
};
