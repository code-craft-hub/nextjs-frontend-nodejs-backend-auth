/**
 * Resume Data Normalizer Utility
 *
 * Normalizes API response data to match the expected UI schema.
 * Maps API fields (e.g., "summary") to schema fields (e.g., "profile").
 *
 * This utility is shared across multiple components to ensure
 * consistent data transformation throughout the application.
 */

export const normalizeResumeData = (data: any): any => {
  if (!data) return data;

  return {
    ...data,
    // Map API's "summary" field to schema's "profile" field
    profile: data.summary || "",
    // Ensure arrays exist
    education: data.education || [],
    workExperience: data.workExperience || [],
    certification: data.certification || [],
    project: data.project || [],
    softSkill: data.softSkill || [],
    hardSkill: data.hardSkill || [],
  };
};
