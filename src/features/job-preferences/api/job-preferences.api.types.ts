export interface JobPreferences {
  workArrangements: ("remote" | "onsite" | "hybrid")[];
  employmentTypes: ("full_time" | "part_time" | "contract" | "internship")[];
  preferredLocations: string[];
  openToRelocation: boolean;
  keywords: string;
}

export interface JobPreferencesResponse {
  success: boolean;
  data: JobPreferences;
}
