"use client";
import { useEffect, useState } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { RefreshCcwIcon } from "lucide-react";

const LOADING_MESSAGES = [
  "We're analyzing the job description...",
  "Matching your skills to the role...",
  "Optimizing your experiences...",
  "Highlighting your key achievements...",
  "Tailoring your professional summary...",
  "Refining your work experience descriptions...",
  "Aligning your projects with job requirements...",
  "Enhancing your skills section...",
  "Customizing your education section...",
  "Showcasing your relevant certifications...",
  "Strengthening your qualifications...",
  "Fine-tuning your resume content...",
  "Maximizing keyword relevance...",
  "Polishing your achievements...",
  "Strengthening your professional narrative...",
  "Optimizing for applicant tracking systems...",
  "Emphasizing your unique value proposition...",
  "Crafting compelling descriptions...",
  "Perfecting your resume for this role...",
  "Almost done—finalizing your tailored resume...",
];

export function ResumeLoadingSkeleton() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="">
      <Empty className="bg-muted/30 h-full animate-pulse">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RefreshCcwIcon className="animate-spin" />
          </EmptyMedia>
          <EmptyTitle>Cver AI is generating Your Resume</EmptyTitle>
          <EmptyDescription className="max-w-xs text-pretty">
            {LOADING_MESSAGES[messageIndex]}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </EmptyContent>
      </Empty>
    </div>
  );
}
