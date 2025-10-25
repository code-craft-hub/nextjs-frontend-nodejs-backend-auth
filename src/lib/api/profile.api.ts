import { ProfileData, ProfileResponse } from "../types";
import { api } from "./client";

// API functions
export const profileApi = {
  getProfile: async (userId: string): Promise<ProfileResponse> => {
    const data = api.get<ProfileResponse>(`/api/users/${userId}`);
    return data;
  },

  updateProfile: async (payload: {
    profileData: ProfileData;
  }): Promise<ProfileResponse> => {
    const data = api.put<ProfileResponse>(
      `/users/update`,
      payload.profileData
    );
    return data;
  },

  createProfile: async (payload: {
    userId: string;
    profileData: ProfileData;
  }): Promise<ProfileResponse> => {
    const data = api.post<ProfileResponse>("/api/users", {
      userId: payload.userId,
      ...payload.profileData,
    });
    return data;
  },
};
