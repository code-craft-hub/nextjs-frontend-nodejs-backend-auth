interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

export const features: FeatureCardProps[] = [
  {
    title: "Tailor your Cv",
    description: "AI powered CV optimization for job application",
    icon: "/tailor-your-cv.svg",
  },
  {
    title: "Generate Cover Letters",
    description: "Create compelling, personalized cover letters instantly",
    icon: "/generate-cover-letter.svg",
  },
  {
    title: "Track Application",
    description: "Organize and monitor all your job applications in one place",
    icon: "/track-application.svg",
  },
  {
    title: "Discover Opportunities",
    description: "Find relevant job openings that match your profile",
    icon: "/discover-opportunies.svg",
  },
  {
    title: "AI-Powered Applications",
    description: "Automate and optimize your entire application process",
    icon: "/ai-powered-application.svg",
  },
  {
    title: "Personalized Recommendations",
    description: "Get tailored career advice based on your goals",
    icon: "/personalized-recommendations.svg",
  },
  {
    title: "Network Insights",
    description: "Connect with the right people in your industry",
    icon: "/network-insights.svg",
  },
  {
    title: "Interview Preparation",
    description: "Practice with AI-generated interview questions",
    icon: "/interview-preparation.svg",
  },
];