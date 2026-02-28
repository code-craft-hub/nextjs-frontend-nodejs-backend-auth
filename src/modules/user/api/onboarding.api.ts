import { api } from "@/lib/api/client";

export interface OnboardingStep1Data {
  country: string;
  state: string;
  phoneNumber: string;
}

export interface OnboardingStep2Data {
  occupation?: string;
  companyName?: string;
}

export interface OnboardingUpdatePayload {
  stepNumber: number;
  [key: string]: any;
}

export interface OnboardingUpdateResponse {
  success: boolean;
  data: {
    id: string;
    onboardingStep: number;
    country: string;
    state: string;
    phoneNumber: string;
    updatedAt: string;
  };
  message: string;
}

/**
 * Update user onboarding information
 * @param payload - Onboarding data with step number
 * @returns Promise with updated user data
 */
export const updateOnboardingStep = async (
  payload: OnboardingUpdatePayload,
) => {
  const response = await api.patch(`/users/onboarding/step`, payload) as any;
  return response?.data;
};

/**
 * Get current onboarding status
 * @returns Promise with onboarding status
 */
export const getOnboardingStatus = async () => {
  await api.get("/user/onboarding");
};
