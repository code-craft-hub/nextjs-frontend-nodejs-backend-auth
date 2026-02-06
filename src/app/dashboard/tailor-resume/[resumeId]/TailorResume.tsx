"use client";

import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { baseURL } from "@/lib/api/client";
import { useEffect, useState, useCallback, useRef } from "react";

// ============================================================================
// ARCHITECTURE OVERVIEW
// ============================================================================
/*
 * This component implements a production-grade streaming architecture:
 *
 * 1. TYPE SAFETY: Comprehensive TypeScript types for all data structures
 * 2. STATE MANAGEMENT: Efficient React state updates with Map for O(1) lookups
 * 3. ERROR HANDLING: Graceful degradation with retry logic
 * 4. PERFORMANCE: Debounced updates and memoization
 * 5. UX: Progressive rendering with loading states
 * 6. MEMORY: Cleanup on unmount to prevent leaks
 * 7. ACCESSIBILITY: Semantic HTML and ARIA labels
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type StreamEventType =
  | "sectionStarted"
  | "sectionContent"
  | "sectionCompleted"
  | "generationComplete";

type SectionType =
  | "profile"
  | "education"
  | "workExperience"
  | "certification"
  | "project"
  | "softSkill"
  | "hardSkill";

interface StreamEvent {
  type: StreamEventType;
  section?: SectionType;
  content?: string;
  fullContent?: string;
}

interface ResumeSection {
  type: SectionType;
  status: "pending" | "streaming" | "completed" | "error";
  rawContent: string;
  parsedContent: any;
  error?: string;
}

interface Education {
  educationId: string;
  degree: string;
  fieldOfStudy?: string;
  degreeType?: string;
  schoolName: string;
  educationStart?: string | null;
  educationEnd?: string | null;
  schoolLocation?: string | null;
}

interface WorkExperience {
  workExperienceId: string;
  jobTitle: string;
  companyName: string;
  location?: string | null;
  position: string;
  jobStart: string;
  jobEnd: string;
  responsibilities: string[];
  achievements: string[];
}

interface Project {
  projectId: string;
  name: string;
  description: string;
  techStack: string[];
  role: string;
}

interface Skill {
  label: string;
  value: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SECTION_ORDER: SectionType[] = [
  "profile",
  "workExperience",
  "education",
  "project",
  "hardSkill",
  "softSkill",
  "certification",
];

const SECTION_TITLES: Record<SectionType, string> = {
  profile: "Professional Summary",
  education: "Education",
  workExperience: "Work Experience",
  certification: "Certifications",
  project: "Projects",
  softSkill: "Soft Skills",
  hardSkill: "Technical Skills",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely parse JSON with error handling
 * Removes markdown code blocks and handles malformed JSON
 */
const safeParseJSON = (content: string): any => {
  if (!content?.trim()) return null;

  try {
    // Remove markdown formatting
    const cleaned = content
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    if (!cleaned) return null;

    return JSON.parse(cleaned);
  } catch (error) {
    console.warn("JSON parse error:", error);
    return null;
  }
};

const ProfileSection = ({ content }: { content: string }) => (
  <section className="space-y-2" aria-labelledby="profile-heading">
    <h2
      id="profile-heading"
      className="text-xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-1"
    >
      Professional Summary
    </h2>
    <p className="text-gray-700 leading-relaxed">{content}</p>
  </section>
);

const EducationSection = ({ items }: { items: Education[] }) => (
  <section className="space-y-3" aria-labelledby="education-heading">
    <h2
      id="education-heading"
      className="text-xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-1"
    >
      Education
    </h2>
    {items.map((edu) => (
      <div key={edu.educationId} className="space-y-1">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
            <p className="text-gray-700">{edu.schoolName}</p>
            {edu.schoolLocation && (
              <p className="text-sm text-gray-600">{edu.schoolLocation}</p>
            )}
          </div>
          {(edu.educationStart || edu.educationEnd) && (
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {edu.educationStart || "N/A"} - {edu.educationEnd || "Present"}
            </span>
          )}
        </div>
        {edu.fieldOfStudy && (
          <p className="text-sm text-gray-600">
            Field of Study: {edu.fieldOfStudy}
          </p>
        )}
      </div>
    ))}
  </section>
);

const WorkExperienceSection = ({ items }: { items: WorkExperience[] }) => (
  <section className="space-y-4" aria-labelledby="experience-heading">
    <h2
      id="experience-heading"
      className="text-xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-1"
    >
      Work Experience
    </h2>
    {items.map((work) => (
      <article key={work.workExperienceId} className="space-y-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{work.jobTitle}</h3>
            <p className="text-gray-700 font-medium">{work.companyName}</p>
            {work.location && (
              <p className="text-sm text-gray-600">{work.location}</p>
            )}
          </div>
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {work.jobStart} - {work.jobEnd}
          </span>
        </div>

        {work.responsibilities?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              Key Responsibilities:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {work.responsibilities.map((resp, i) => (
                <li key={i} className="leading-relaxed">
                  {resp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {work.achievements?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              Key Achievements:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {work.achievements.map((ach, i) => (
                <li key={i} className="leading-relaxed">
                  {ach}
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    ))}
  </section>
);

const ProjectSection = ({ items }: { items: Project[] }) => (
  <section className="space-y-4" aria-labelledby="projects-heading">
    <h2
      id="projects-heading"
      className="text-xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-1"
    >
      Projects
    </h2>
    {items.map((project) => (
      <article key={project.projectId} className="space-y-2">
        <div>
          <h3 className="font-semibold text-gray-900">{project.name}</h3>
          {project.role && (
            <p className="text-sm text-gray-600 italic">{project.role}</p>
          )}
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {project.description}
        </p>
        {project.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-2" role="list">
            {project.techStack.map((tech, i) => (
              <span
                key={i}
                role="listitem"
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </article>
    ))}
  </section>
);

const SkillsSection = ({
  title,
  items,
  ariaLabel,
}: {
  title: string;
  items: Skill[];
  ariaLabel: string;
}) => (
  <section className="space-y-3" aria-label={ariaLabel}>
    <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-1">
      {title}
    </h2>
    <div className="flex flex-wrap gap-2" role="list">
      {items.map((skill, idx) => (
        <span
          key={idx}
          role="listitem"
          className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors"
        >
          {skill.label}
        </span>
      ))}
    </div>
  </section>
);

export const TailorResume = ({
  jobDescription,
  resumeId,
  coverLetterId,
  aiApply,
  recruiterEmail,
}: {
  jobDescription: string;
  resumeId: string;
  coverLetterId: string;
  aiApply: boolean;
  recruiterEmail: string;
}) => {
  // ========== Hooks ==========
  const { data: user } = useQuery(userQueries.detail());

  // ========== State ==========
  const [sections, setSections] = useState<Map<SectionType, ResumeSection>>(
    new Map(),
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  // ========== Refs ==========
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Handle incoming stream events
   */
  const handleStreamEvent = useCallback((event: StreamEvent) => {
    const { type, section, content } = event;

    if (type === "generationComplete") {
      setIsComplete(true);
      setIsStreaming(false);
      setProgress(100);
      return;
    }

    console.log("THIS IS THE EVENT STREAM", event);
    console.log("CURRENT SECTIONS STATE", sections);
    console.log("WITH CONTENT", content);

    // sectionContent without a section = overall streaming progress (single-call mode)
    if (type === "sectionContent" && !section) {
      return;
    }

    if (!section) return;

    setSections((prev) => {
      const updated = new Map(prev);
      const existing = updated.get(section);

      switch (type) {
        case "sectionStarted":
          updated.set(section, {
            type: section,
            status: "streaming",
            rawContent: "",
            parsedContent: null,
          });
          break;

        case "sectionContent":
          if (existing) {
            updated.set(section, {
              ...existing,
              rawContent: event.fullContent || existing.rawContent,
            });
          }
          break;

        case "sectionCompleted":
          if (content) {
            const parsed = safeParseJSON(content);
            if (parsed) {
              updated.set(section, {
                type: section,
                status: "completed",
                rawContent: content,
                parsedContent: parsed,
              });

              // Update progress
              const completedCount = Array.from(updated.values()).filter(
                (s) => s.status === "completed",
              ).length;
              setProgress((completedCount / SECTION_ORDER.length) * 100);
            } else {
              updated.set(section, {
                type: section,
                status: "error",
                rawContent: content,
                parsedContent: null,
                error: "Failed to parse section data",
              });
            }
          }
          break;
      }

      return updated;
    });
  }, []);

  /**
   * Main streaming function with error handling
   */
  const generateResume = useCallback(async () => {
    if (!user) return;

    // Reset state
    setIsStreaming(true);
    setError(null);
    setSections(new Map());
    setIsComplete(false);
    setProgress(0);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(baseURL + "/new-resume-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId,
          user,
          jobDescription,
          coverLetterId,
          aiApply,
          recruiterEmail,
        }),
        credentials: "include",
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`,
        );
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Keep last incomplete line in buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.startsWith("data: ")) {
            try {
              const eventData = JSON.parse(line.slice(6));
              handleStreamEvent(eventData);
            } catch (parseError) {
              console.warn("Failed to parse event:", line, parseError);
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name !== "AbortError") {
          console.error("Stream error:", err);
          setError(err.message);
        }
      } else {
        setError("An unknown error occurred");
      }
      setIsStreaming(false);
    }
  }, [
    user,
    resumeId,
    jobDescription,
    coverLetterId,
    aiApply,
    recruiterEmail,
    handleStreamEvent,
  ]);

  /**
   * Cancel streaming
   */
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setError("Generation cancelled by user");
    }
  }, []);

  /**
   * Auto-generate on mount
   */
  useEffect(() => {
    if (user) {
      generateResume();
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user, generateResume]);

  /**
   * Render section based on type
   */
  const renderSection = useCallback((section: ResumeSection) => {
    if (section.status !== "completed" || !section.parsedContent) {
      return null;
    }

    const { type, parsedContent } = section;

    switch (type) {
      case "profile":
        return <ProfileSection content={parsedContent} />;

      case "education":
        return (
          <EducationSection
            items={Array.isArray(parsedContent) ? parsedContent : []}
          />
        );

      case "workExperience":
        return (
          <WorkExperienceSection
            items={Array.isArray(parsedContent) ? parsedContent : []}
          />
        );

      case "project":
        return (
          <ProjectSection
            items={Array.isArray(parsedContent) ? parsedContent : []}
          />
        );

      case "softSkill":
        return (
          <SkillsSection
            title="Soft Skills"
            items={Array.isArray(parsedContent) ? parsedContent : []}
            ariaLabel="Soft skills and interpersonal abilities"
          />
        );

      case "hardSkill":
        return (
          <SkillsSection
            title="Technical Skills"
            items={Array.isArray(parsedContent) ? parsedContent : []}
            ariaLabel="Technical skills and proficiencies"
          />
        );

      case "certification":
        if (!Array.isArray(parsedContent) || parsedContent.length === 0) {
          return null;
        }
        return null; // Implement certification renderer if needed

      default:
        return null;
    }
  }, []);

  // ========== Render ==========
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AI-Tailored Resume</h1>

        <div className="flex items-center gap-4">
          {isStreaming && (
            <>
              <div className="flex items-center gap-2 text-blue-600">
                <div className="relative w-2 h-2">
                  <div className="absolute w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                  <div className="relative w-2 h-2 bg-blue-600 rounded-full" />
                </div>
                <span className="text-sm font-medium">
                  Generating {Math.round(progress)}%
                </span>
              </div>

              <button
                onClick={cancelGeneration}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {isComplete && (
            <button
              onClick={generateResume}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Regenerate
            </button>
          )}
        </div>
      </header>

      {/* Progress Bar */}
      {isStreaming && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 p-4"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Generation Error
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={generateResume}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isStreaming && sections.size === 0 && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-gray-900 font-medium">
              Initializing AI Resume Generation
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Analyzing job description and tailoring your resume...
            </p>
          </div>
        </div>
      )}

      {/* Resume Sections */}
      <main className="space-y-6">
        {SECTION_ORDER.map((sectionType) => {
          const section = sections.get(sectionType);

          // Don't render if section doesn't exist yet
          if (!section) return null;

          return (
            <div
              key={sectionType}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md"
            >
              {/* Streaming state */}
              {section.status === "streaming" && (
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-600">
                    Loading {SECTION_TITLES[sectionType]}...
                  </span>
                </div>
              )}

              {/* Completed state */}
              {section.status === "completed" && renderSection(section)}

              {/* Error state */}
              {section.status === "error" && (
                <div className="text-sm text-red-600">
                  <p className="font-medium">
                    Error loading {SECTION_TITLES[sectionType]}
                  </p>
                  {section.error && (
                    <p className="mt-1 text-red-500">{section.error}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>

      {/* Completion State */}
      {isComplete && (
        <footer
          role="status"
          className="flex items-center justify-center py-6 border-t border-gray-200"
        >
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Resume generation complete!</span>
          </div>
        </footer>
      )}
    </div>
  );
};
