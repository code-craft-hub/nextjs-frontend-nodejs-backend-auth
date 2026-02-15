"use client";

import { useState } from "react";
import { Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeForm } from "./ResumeFormContext";
import PersonalInfoForm from "./PersonalInfoForm";
import ProfessionalSummaryForm from "./ProfessionalSummaryForm";
import ExperienceForm from "./WorkExperienceForm";
import SkillsForm from "./SkillsForm";
import EducationSection from "./EducationSection";
import ProjectsForm from "./ProjectCardSection";
import CertificationAchievementsForm from "./CertificationAchievementsForm";

type Section = {
  id: number;
  label: string;
  component: React.ComponentType<{
    onNext?: () => void;
    onBack?: () => void;
    handleEditClick: (value: boolean) => void;
  }>;
};

const sections: Section[] = [
  { id: 1, label: "Personal Info", component: PersonalInfoForm },
  { id: 2, label: "Summary", component: ProfessionalSummaryForm },
  { id: 3, label: "Experience", component: ExperienceForm },
  { id: 4, label: "Education", component: EducationSection },
  { id: 5, label: "Skills", component: SkillsForm },
  {
    id: 6,
    label: "Projects & Certifications",
    component: ProjectsAndCertifications,
  },
];

function ProjectsAndCertifications({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  const [showProjects, setShowProjects] = useState(true);

  return (
    <div>
      {showProjects ? (
        <div>
          <ProjectsForm onBack={onBack} />
          <div className="flex justify-center py-8">
            <Button
              onClick={() => setShowProjects(false)}
              variant="default"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Continue to Certifications
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <CertificationAchievementsForm
            onBack={() => setShowProjects(true)}
            onContinue={onNext}
          />
        </div>
      )}
    </div>
  );
}

export default function ResumeFormLayout({
  handleEditClick,
}: {
  handleEditClick: (value: boolean) => void;
}) {
  const { isLoading } = useResumeForm();
  const [activeSection, setActiveSection] = useState(1);

  const currentSection = sections.find((s) => s.id === activeSection);
  const ActiveComponent = currentSection?.component || PersonalInfoForm;

  const progress = Math.round((activeSection / sections.length) * 100);
  const completedSections = activeSection;

  const handleSectionChange = (sectionId: number) => {
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (activeSection < sections.length) {
      handleSectionChange(activeSection + 1);
    }
  };

  const handleBack = () => {
    if (activeSection > 1) {
      handleSectionChange(activeSection - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className=" flex items-start justify-center">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className="flex flex-col gap-4 sm:gap-8 w-full md:w-70 shrink-0">
          {/* Form Sections Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Form Sections
            </p>

            <nav className="flex flex-col gap-1.5">
              {sections.map((section) => {
                const isActive = section.id === activeSection;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                        : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : section.id < activeSection
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {section.id < activeSection ? "\u2713" : section.id}
                    </span>
                    <span className="flex-1 text-left">{section.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Progress */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">
                  Progress
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {completedSections} of {sections.length} sections completed
              </p>
            </div>
          </div>

          {/* Need Help Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <Headphones className="w-4 h-4 text-gray-500" />
              </span>
              <span className="font-semibold text-gray-900 text-sm">
                Need Help?
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Our support team is here to assist you with any questions.
            </p>
            <Button
              variant="outline"
              className="w-full text-sm font-medium border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
              type="button"
            >
              Contact Support
            </Button>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="animate-fadeIn">
            <ActiveComponent
              onNext={handleNext}
              onBack={handleBack}
              handleEditClick={handleEditClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
