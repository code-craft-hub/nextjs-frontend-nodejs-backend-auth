import { api } from "./client";
import { BACKEND_API_VERSION } from "./profile.api";

// ─── Types ────────────────────────────────────────────────────────

export interface AIApplySettings {
  id?: string;
  userId?: string;
  autoApplyEnabled: boolean;
  autoSendApplications: boolean;
  saveAsDrafts: boolean;
  generateTailoredCv: boolean;
  useMasterCv: boolean;
  masterCvId?: string | null;
  minMatchScore?: number;
  maxApplicationsPerDay?: number;
  maxApplicationsPerWeek?: number;
  preferredJobTypes?: string[];
  preferredWorkLocations?: string[];
  excludedCompanies?: string[];
  preferredLocations?: string[];
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAISettingsData {
  autoApplyEnabled?: boolean;
  autoSendApplications?: boolean;
  saveAsDrafts?: boolean;
  generateTailoredCv?: boolean;
  useMasterCv?: boolean;
  masterCvId?: string | null;
  minMatchScore?: number;
  maxApplicationsPerDay?: number;
  maxApplicationsPerWeek?: number;
  preferredJobTypes?: string[];
  preferredWorkLocations?: string[];
  excludedCompanies?: string[];
  preferredLocations?: string[];
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: string;
}

export interface UpdateAISettingsData {
  autoApplyEnabled?: boolean;
  autoSendApplications?: boolean;
  saveAsDrafts?: boolean;
  generateTailoredCv?: boolean;
  useMasterCv?: boolean;
  masterCvId?: string | null;
  minMatchScore?: number;
  maxApplicationsPerDay?: number;
  maxApplicationsPerWeek?: number;
  preferredJobTypes?: string[];
  preferredWorkLocations?: string[];
  excludedCompanies?: string[];
  preferredLocations?: string[];
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── API Client ───────────────────────────────────────────────────

const AI_SETTINGS_BASE = `/${BACKEND_API_VERSION}/ai-apply-settings`;

export const aiSettingsApi = {
  /**
   * @route GET /api/v1/ai-apply-settings
   * @desc Get AI apply settings for the authenticated user
   */
  getSettings: (token?: string) =>
    api.get<ApiResponse<AIApplySettings>>(`${AI_SETTINGS_BASE}`, {
      token,
    }),

  /**
   * @route POST /api/v1/ai-apply-settings
   * @desc Create or update AI apply settings (upsert)
   */
  createOrUpdateSettings: (data: CreateAISettingsData, token?: string) =>
    api.post<ApiResponse<AIApplySettings>>(`${AI_SETTINGS_BASE}`, data, {
      token,
    }),

  /**
   * @route PATCH /api/v1/ai-apply-settings
   * @desc Partially update AI apply settings
   */
  updateSettings: (data: UpdateAISettingsData, token?: string) =>
    api.patch<ApiResponse<AIApplySettings>>(`${AI_SETTINGS_BASE}`, data, {
      token,
    }),

  /**
   * @route PATCH /api/v1/ai-apply-settings/toggle-auto-apply
   * @desc Toggle the auto-apply feature on or off
   */
  toggleAutoApply: (enabled: boolean, token?: string) =>
    api.patch<ApiResponse<AIApplySettings>>(
      `${AI_SETTINGS_BASE}/toggle-auto-apply`,
      { enabled },
      { token }
    ),

  /**
   * @route DELETE /api/v1/ai-apply-settings
   * @desc Soft delete AI apply settings
   */
  deleteSettings: (token?: string) =>
    api.delete<ApiResponse<{ id: string; message: string }>>(
      `${AI_SETTINGS_BASE}`,
      { token }
    ),
};
