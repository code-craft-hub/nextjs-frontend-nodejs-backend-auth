/**
 * AI Apply Navigation Helper
 *
 * Manages the complex navigation flow for AI Apply with backend-generated document IDs.
 * The flow is:
 * 1. AIApplyInput → `/dashboard/tailor-cover-letter/pending?jobDescription=...&recruiterEmail=...`
 * 2. TailorCoverLetter generates → `/dashboard/tailor-cover-letter/pending?coverLetterDocId=xxx&jobDescription=...&recruiterEmail=...`
 * 3. TailorCoverLetter → `/dashboard/tailor-resume/pending?coverLetterDocId=xxx&jobDescription=...&recruiterEmail=...`
 * 4. TailorResume generates → `/dashboard/tailor-resume/pending?coverLetterDocId=xxx&resumeDocId=yyy&jobDescription=...&recruiterEmail=...`
 * 5. TailorResume → `/dashboard/preview?coverLetterDocId=xxx&resumeDocId=yyy&jobDescription=...&recruiterEmail=...`
 */

export const AI_APPLY_PLACEHOLDER_ID = "pending";

/**
 * Build URL for starting the cover letter generation
 */
export function buildCoverLetterStartUrl(
  jobDescription: string,
  recruiterEmail: string,
): string {
  const params = new URLSearchParams();
  params.set("recruiterEmail", recruiterEmail);
  params.set("aiApply", "true");
  params.set("jobDescription", jobDescription);
  return `/dashboard/tailor-cover-letter/${AI_APPLY_PLACEHOLDER_ID}?${params.toString()}`;
}

/**
 * Build URL for starting the cover letter generation
 */
export function buildAutoApplyStartUrl(
  jobDescription: string,
  recruiterEmail: string,
  jobId?: string,
): string {
  const params = new URLSearchParams();
  if (jobId) params.set("job-id", jobId);
  params.set("recruiter-email", recruiterEmail);
  params.set("job-description", jobDescription);
  return `/dashboard/auto-apply?${params.toString()}`;
}

/**
 * Build URL for navigating to resume after cover letter is generated
 */
export function buildResumeStartUrl(
  coverLetterDocId: string,
  jobDescription: string,
  recruiterEmail: string,
): string {
  const params = new URLSearchParams();
  params.set("coverLetterDocId", coverLetterDocId);
  params.set("recruiterEmail", recruiterEmail);
  params.set("aiApply", "true");
  params.set("jobDescription", jobDescription);
  return `/dashboard/tailor-resume/${AI_APPLY_PLACEHOLDER_ID}?${params.toString()}`;
}

/**
 * Build URL for updating cover letter with generated documentId
 */
export function buildCoverLetterUpdateUrl(coverLetterDocId: string): string {
  const params = new URLSearchParams();
  params.set("coverLetterDocId", coverLetterDocId);
  return `/dashboard/tailor-cover-letter?${params.toString()}`;
}

/**
 * Build URL for updating resume with generated documentId
 */
export function buildResumeUpdateUrl(resumeDocId: string): string {
  return `/dashboard/tailor-resume?resumeId=${resumeDocId}`;
  // return `/dashboard/tailor-resume/${resumeDocId}?${params.toString()}`;
}

/**
 * Build URL for preview page after all documents are generated
 */
export function buildPreviewUrl(
  autoApplyId?: string,
  coverLetterDocId?: string,
  resumeDocId?: string,
  recruiterEmail?: string,
  options?: { masterCvId?: string },
): string {
  const params = new URLSearchParams();
  if (autoApplyId) params.set("auto-apply-id", autoApplyId);
  if (coverLetterDocId) params.set("cover-letter-id", coverLetterDocId);
  if (resumeDocId) params.set("resume-id", resumeDocId);
  if (recruiterEmail) params.set("recruiter-email", recruiterEmail);
  if (options?.masterCvId) {
    params.set("master-cv-id", options.masterCvId);
  }
  return `/dashboard/preview?${params.toString()}`;
}

/**
 * Check if an ID is still a placeholder (not yet generated)
 */
export function isPlaceholderId(id: string | undefined | null): boolean {
  return !id || id === AI_APPLY_PLACEHOLDER_ID;
}
