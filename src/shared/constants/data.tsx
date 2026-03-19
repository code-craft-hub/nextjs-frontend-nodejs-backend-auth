//  icons
import { FiMail, FiMapPin } from "react-icons/fi";
import { BiPlus } from "react-icons/bi";
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";
import { BiLogoLinkedin } from "react-icons/bi";

// social
export const social = [
  {
    icon: <FaFacebook />,
    href: "https://www.facebook.com/cverai",
  },
  {
    icon: <FaTwitter />,
    href: "",
  },
  {
    icon: <BiLogoLinkedin />,
    href: "https://www.linkedin.com/company/cver-ai",
  },
  {
    icon: <FaInstagram />,
    href: "https://www.instagram.com/cver_ai",
  },
  {
    icon: <FaYoutube />,
    href: "https://www.youtube.com/@cverai",
  },
];

// services
export const services = [
  {
    icon: <BiPlus />,
    name: "What is an AI Resume Builder?",
  },
  {
    icon: <BiPlus />,
    name: "How does the AI Resume Builder work?",
  },
  {
    icon: <BiPlus />,
    name: "Is my data safe and secure?",
  },
  {
    icon: <BiPlus />,
    name: "Can I edit the generated resume?",
  },
  {
    icon: <BiPlus />,
    name: "Can I use the AI Resume Builder for multiple job applications?",
  },
  {
    icon: <BiPlus />,
    name: "Is there a cost to use the AI Resume Builder?",
  },
];

// contact
export const contact = [
  {
    icon: <FiMail />,
    title: "Have a question?",
    subtitle: "I am here to help you.",
    description: "Email me at hello@youremail.com",
  },
  {
    icon: <FiMapPin />,
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
