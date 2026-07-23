/** Apply-channel filter for the recommendation/job feed. */
export type ApplyMode = "all" | "external" | "email";

export interface JobPreferences {
  workArrangements: ("remote" | "onsite" | "hybrid")[];
  employmentTypes: ("full_time" | "part_time" | "contract" | "internship")[];
  preferredLocations: string[];
  openToRelocation: boolean;
  keywords: string;
  /** Which apply channel to surface in the feed. Defaults to "all". */
  applyMode: ApplyMode;
}

export interface JobPreferencesResponse {
  success: boolean;
  data: JobPreferences;
}
