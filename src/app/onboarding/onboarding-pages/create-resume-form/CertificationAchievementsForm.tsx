"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Award, ArrowLeft, ArrowRight } from "lucide-react";
import { useResumeForm } from "./ResumeFormContext";
import { CloseEditButton } from "@/components/shared/CloseEditButton";
import {
  useCreateCertificationMutation,
  useUpdateCertificationMutation,
  useDeleteCertificationMutation,
} from "@/lib/mutations/resume.mutations";
import { useTriggerJobRecommendationsMutation } from "@/lib/mutations/recommendations.mutations";

// ─── Schema ────────────────────────────────────────────────────────

const certificationEntrySchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  issuer: z.string().optional(),
  issueDate: z.string().optional(),
  description: z.string().optional(),
  credentialUrl: z.string().optional(),
});

const certificationFormSchema = z.object({
  certifications: z.array(certificationEntrySchema).min(1),
});

type CertificationFormValues = z.infer<typeof certificationFormSchema>;

// ─── Single Certification Card ─────────────────────────────────────

function CertificationCard({
  index,
  control,
  remove,
  canRemove,
}: {
  index: number;
  control: any;
  remove: (i: number) => void;
  canRemove: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-2 sm:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-gray-900">
          Certification #{index + 1}
        </h2>
        {canRemove && (
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
            aria-label="Remove certification"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <FormField
        control={control}
        name={`certifications.${index}.title`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-900">
              Title
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Google UX Design Professional Certificate"
                className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`certifications.${index}.issuer`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-900">
                Issuer
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Google / Coursera"
                  className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`certifications.${index}.issueDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-900">
                Issue Date
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 2023 or 01/2023"
                  className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={`certifications.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-900">
              Description{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Brief description of what the certification covers"
                rows={3}
                className="resize-none rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm leading-relaxed focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`certifications.${index}.credentialUrl`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-900">
              Credential URL{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="https://credential.example.com/verify/..."
                className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

interface CertificationAchievementsFormProps {
  onBack?: () => void;
  onSaveDraft?: () => void;
  onContinue?: () => void;
  handleEditClick: (isEditing: boolean) => void;
  onboardingResumeUploadCompleted?: () => void;
}

export default function CertificationAchievementsForm({
  onBack,
  onSaveDraft,
  onContinue,
  handleEditClick,
  onboardingResumeUploadCompleted,
}: CertificationAchievementsFormProps) {
  const {
    resumeId,
    resumeData,
    updateResumeField,
    createNewResume,
    isCreating,
  } = useResumeForm();
  const createMutation = useCreateCertificationMutation();
  const updateMutation = useUpdateCertificationMutation(resumeId || "");
  const deleteMutation = useDeleteCertificationMutation(resumeId || "");
  const triggerRecommendationsMutation = useTriggerJobRecommendationsMutation();

  const completedResumeBuild = async () => {
    // Submit the form and wait for it to complete
    await form.handleSubmit(onSubmit)();

    // Trigger job recommendations
    await triggerRecommendationsMutation.mutateAsync();

    // Notify that resume building is completed
    onboardingResumeUploadCompleted?.();
  };

  const existingCertifications = resumeData?.certification || [];

  const form = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationFormSchema),
    defaultValues: {
      certifications:
        existingCertifications.length > 0
          ? existingCertifications.map((cert) => ({
              id: cert.id || undefined,
              title: cert.title || cert.name || "",
              issuer: cert.issuer || "",
              issueDate: cert.issueDate
                ? new Date(cert.issueDate).getFullYear().toString()
                : "",
              description: cert.description || "",
              credentialUrl: cert.credentialUrl || "",
            }))
          : [
              {
                title: "",
                issuer: "",
                issueDate: "",
                description: "",
                credentialUrl: "",
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  async function onSubmit(values: CertificationFormValues) {
    let activeResumeId = resumeId;

    // If no resume exists, create one first
    if (!activeResumeId) {
      const newResumeId = await createNewResume("My Resume");
      if (!newResumeId) {
        console.error("Failed to create resume");
        return;
      }
      activeResumeId = newResumeId;
    }

    const savePromises = values.certifications.map((cert) => {
      const payload = {
        title: cert.title,
        name: cert.title,
        issuer: cert.issuer,
        issueDate: cert.issueDate,
        description: cert.description,
        credentialUrl: cert.credentialUrl,
      };

      if (cert.id) {
        return updateMutation.mutateAsync({ id: cert.id, data: payload });
      }
      return createMutation.mutateAsync({ resumeId: activeResumeId, data: payload });
    });

    await Promise.all(savePromises);
    updateResumeField(
      "certification",
      values.certifications.map((cert) => ({
        id: cert.id,
        title: cert.title,
        name: cert.title,
        issuer: cert.issuer,
        issueDate: cert.issueDate,
        description: cert.description,
        credentialUrl: cert.credentialUrl,
      })),
    );
    onContinue?.();
    handleEditClick(false);
  }

  const handleRemoveCertification = (index: number) => {
    const cert = form.getValues(`certifications.${index}`);
    if (cert.id && resumeId) {
      deleteMutation.mutate(cert.id);
    }
    remove(index);
  };

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    isCreating ||
    triggerRecommendationsMutation.isPending;

  return (
    <div className="w-full flex flex-col gap-6 relative">
      <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
        {/* Section header */}
        <div className="flex items-start gap-4 mb-7">
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-yellow-100 shrink-0 mt-0.5">
            <Award className="w-5 h-5 text-yellow-500" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Certification &amp; Achievements
              </h1>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium shrink-0">
                Optional
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              Highlight professional certifications, awards, or notable
              achievements.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field, index) => (
              <CertificationCard
                key={field.id}
                index={index}
                control={form.control}
                remove={handleRemoveCertification}
                canRemove={fields.length > 1}
              />
            ))}

            <button
              type="button"
              onClick={() =>
                append({
                  title: "",
                  issuer: "",
                  issueDate: "",
                  description: "",
                  credentialUrl: "",
                })
              }
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-indigo-400 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Another Certification
            </button>
          </form>
        </Form>
      </div>
      <CloseEditButton
        onClick={() => handleEditClick(false)}
        ariaLabel="Close certifications form"
        className="top-2 right-2"
      />
      {/* Bottom navigation */}
      <div className="grid grid-cols-3 items-center justify-center gap-4 sm:gap-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-12 px-6 rounded-xl border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onSaveDraft}
          className="h-12 px-6 rounded-xl border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50"
        >
          Save as Draft
        </Button>

        <Button
          type="button"
          disabled={isSaving}
          onClick={completedResumeBuild}
          className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm gap-2 transition-colors"
        >
          {isSaving ? "Saving..." : "Continue to Preview"}
          {!isSaving && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
