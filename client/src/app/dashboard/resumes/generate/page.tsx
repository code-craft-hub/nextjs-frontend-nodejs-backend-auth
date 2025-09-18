"use client";
import React, { useState, useRef } from "react";
import {
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Award,
  Code,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface ResumeSection {
  type:
    | "profile"
    | "education"
    | "workExperience"
    | "certifications"
    | "projects"
    | "skills";
  content: string;
  isComplete: boolean;
  isStreaming: boolean;
  error?: string;
}

interface StreamEvent {
  type:
    | "sectionStarted"
    | "sectionContent"
    | "sectionCompleted"
    | "sectionError"
    | "generationComplete"
    | "error";
  section?: string;
  content?: string;
  fullContent?: string;
  error?: string;
  sections?: Record<string, string>;
  timestamp: string;
}

export const ResumeDetailPage: React.FC = () => {
  const [sections, setSections] = useState<Record<string, ResumeSection>>({
    profile: {
      type: "profile",
      content: "",
      isComplete: false,
      isStreaming: false,
    },
    education: {
      type: "education",
      content: "",
      isComplete: false,
      isStreaming: false,
    },
    workExperience: {
      type: "workExperience",
      content: "",
      isComplete: false,
      isStreaming: false,
    },
    certifications: {
      type: "certifications",
      content: "",
      isComplete: false,
      isStreaming: false,
    },
    projects: {
      type: "projects",
      content: "",
      isComplete: false,
      isStreaming: false,
    },
    skills: {
      type: "skills",
      content: "",
      isComplete: false,
      isStreaming: false,
    },
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  // Sample data - replace with your form inputs
  const sampleUserProfile = {
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1-555-0123",
    location: "San Francisco, CA",
    linkedIn: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    currentRole: "Full Stack Developer",
    yearsOfExperience: 5,
    skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "University of California, Berkeley",
        year: "2019",
        gpa: "3.8",
      },
    ],
    workExperience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Innovations Inc.",
        duration: "2022 - Present",
        description:
          "Led development of microservices architecture, improved system performance by 40%",
      },
    ],
    projects: [
      {
        name: "E-commerce Platform",
        description:
          "Built a full-stack e-commerce platform using React, Node.js, and MongoDB",
        technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
      },
    ],
    certifications: [
      {
        name: "AWS Solutions Architect",
        issuer: "Amazon Web Services",
        date: "2023",
      },
    ],
  };

  const sampleJobDescription = {
    title: "Senior Full Stack Developer",
    company: "Innovative Tech Solutions",
    requirements: [
      "5+ years of experience in full-stack development",
      "Proficiency in React, Node.js, and modern JavaScript",
      "Experience with cloud platforms (AWS preferred)",
      "Strong understanding of RESTful APIs and microservices",
      "Bachelor's degree in Computer Science or related field",
    ],
    responsibilities: [
      "Lead development of scalable web applications",
      "Collaborate with cross-functional teams",
      "Mentor junior developers",
      "Drive technical decision-making",
    ],
    preferredSkills: ["Docker", "Kubernetes", "GraphQL", "TypeScript"],
    experience: "5+ years",
    education: "Bachelor's degree preferred",
    industry: "Technology",
  };

  const sectionIcons = {
    profile: User,
    education: GraduationCap,
    workExperience: Briefcase,
    certifications: Award,
    projects: Code,
    skills: Settings,
  };

  const sectionTitles = {
    profile: "Professional Profile",
    education: "Education",
    workExperience: "Work Experience",
    certifications: "Certifications",
    projects: "Projects",
    skills: "Skills",
  };

  const generateResume = async () => {
    setIsGenerating(true);
    setGenerationComplete(false);
    setError(null);
    setProgress(0);

    // Reset sections
    setSections((prev) => {
      const resetSections = { ...prev };
      Object.keys(resetSections).forEach((key) => {
        resetSections[key] = {
          ...resetSections[key],
          content: "",
          isComplete: false,
          isStreaming: false,
          error: undefined,
        };
      });
      return resetSections;
    });

    try {
      const response = await fetch(
        "http://localhost:8080/api/generate-resume-stream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userProfile: sampleUserProfile,
            jobDescription: sampleJobDescription,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const eventData: StreamEvent = JSON.parse(line.substring(6));
              handleStreamEvent(eventData);
            } catch (parseError) {
              console.warn("Failed to parse event data:", parseError);
            }
          }
        }
      }
    } catch (err) {
      console.error("Resume generation error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setIsGenerating(false);
    }
  };

  const handleStreamEvent = (event: StreamEvent) => {
    switch (event.type) {
      case "sectionStarted":
        if (event.section) {
          setSections((prev) => ({
            ...prev,
            [event.section!]: {
              ...prev[event.section!],
              isStreaming: true,
              content: "",
            },
          }));
        }
        break;

      case "sectionContent":
        if (event.section && event.content) {
          setSections((prev) => ({
            ...prev,
            [event.section!]: {
              ...prev[event.section!],
              content:
                event.fullContent ||
                prev[event.section!].content + event.content,
              isStreaming: true,
            },
          }));
        }
        break;

      case "sectionCompleted":
        if (event.section) {
          setSections((prev) => ({
            ...prev,
            [event.section!]: {
              ...prev[event.section!],
              content: event.content || prev[event.section!].content,
              isComplete: true,
              isStreaming: false,
            },
          }));

          // Update progress
          setProgress((prev) => {
            const completedSections =
              Object.values(sections).filter((s) => s.isComplete).length + 1;
            return (completedSections / 6) * 100;
          });
        }
        break;

      case "sectionError":
        if (event.section) {
          setSections((prev) => ({
            ...prev,
            [event.section!]: {
              ...prev[event.section!],
              error: event.error,
              isStreaming: false,
            },
          }));
        }
        break;

      case "generationComplete":
        setIsGenerating(false);
        setGenerationComplete(true);
        setProgress(100);
        break;

      case "error":
        setError(event.error || "An error occurred during generation");
        setIsGenerating(false);
        break;
    }
  };

  const stopGeneration = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsGenerating(false);
  };

  const renderSectionStatus = (section: ResumeSection) => {
    if (section.error) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    if (section.isComplete) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (section.isStreaming) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    return (
      <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
    );
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, index) => (
      <p key={index} className="mb-2 leading-relaxed">
        {line}
      </p>
    ));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          Live Resume Generator
        </h1>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Generate Resume
              </h2>
              <p className="text-gray-600">
                Targeting: {sampleJobDescription.title} at{" "}
                {sampleJobDescription.company}
              </p>
            </div>

            <div className="flex gap-3">
              {!isGenerating ? (
                <button
                  onClick={generateResume}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Generate Resume
                </button>
              ) : (
                <button
                  onClick={stopGeneration}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Stop Generation
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {generationComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  Resume generation completed successfully!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {Object.entries(sections).map(([key, section]) => {
            const Icon = sectionIcons[key as keyof typeof sectionIcons];
            return (
              <div
                key={key}
                className="bg-white rounded-lg p-4 shadow-sm border"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-6 h-6 text-gray-600" />
                  {renderSectionStatus(section)}
                </div>
                <h3 className="text-sm font-medium text-gray-800">
                  {sectionTitles[key as keyof typeof sectionTitles]}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {section.error
                    ? "Error"
                    : section.isComplete
                    ? "Complete"
                    : section.isStreaming
                    ? "Generating..."
                    : "Pending"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resume Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" ref={sectionsRef}>
        {Object.entries(sections).map(([key, section]) => {
          const Icon = sectionIcons[key as keyof typeof sectionIcons];
          return (
            <div
              key={key}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6" />
                    <h3 className="text-lg font-semibold">
                      {sectionTitles[key as keyof typeof sectionTitles]}
                    </h3>
                  </div>
                  {renderSectionStatus(section)}
                </div>
              </div>

              <div className="p-6">
                {section.error ? (
                  <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Generation Error</span>
                    </div>
                    <p className="text-sm">{section.error}</p>
                  </div>
                ) : section.content ? (
                  <div className="text-gray-800 leading-relaxed">
                    {formatContent(section.content)}
                    {section.isStreaming && (
                      <div className="inline-flex items-center gap-2 text-blue-600 mt-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Generating...</span>
                      </div>
                    )}
                  </div>
                ) : section.isStreaming ? (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    <span>Starting generation...</span>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    <Icon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Waiting to generate content...</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Export Options */}
      {generationComplete && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Export Options
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => {
                const resumeData = Object.entries(sections)
                  .map(
                    ([key, section]) =>
                      `${sectionTitles[key as keyof typeof sectionTitles]}:\n${
                        section.content
                      }`
                  )
                  .join("\n\n");

                const blob = new Blob([resumeData], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${sampleUserProfile.name.replace(
                  /\s+/g,
                  "_"
                )}_Resume.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Download as Text
            </button>

            <button
              onClick={() => {
                const resumeData = {
                  userProfile: sampleUserProfile,
                  jobDescription: sampleJobDescription,
                  generatedSections: Object.fromEntries(
                    Object.entries(sections).map(([key, section]) => [
                      key,
                      section.content,
                    ])
                  ),
                  generatedAt: new Date().toISOString(),
                };

                const blob = new Blob([JSON.stringify(resumeData, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${sampleUserProfile.name.replace(
                  /\s+/g,
                  "_"
                )}_Resume_Data.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
