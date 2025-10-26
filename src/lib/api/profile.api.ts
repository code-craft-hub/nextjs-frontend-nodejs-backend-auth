import { ProfileData, ProfileResponse } from "../types";
import { api } from "./client";

// API functions
export const profileApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    const data = api.get<ProfileResponse>(`/users/`);
    return data;
  },

  updateDataSource: async (payload: {
    profileData: ProfileData;
  }): Promise<ProfileResponse> => {
    const data = await api.put<ProfileResponse>(
      `/users/create-update-data-source`,
      payload.profileData
    );
    return data;
  },

  createDataSource: async (payload: {
    profileData: ProfileData;
  }): Promise<ProfileResponse> => {
    const data = await api.put<ProfileResponse>(
      "/users/create-update-data-source",
      {
        ...payload.profileData,
      }
    );
    return data;
  },
  deleteDataSource: async (): Promise<ProfileResponse> => {
    try {
      const data = await api.delete<ProfileResponse>(
        "/users/delete-data-source"
      );
      console.log("Deleted data source:", data);
      return data;
    } catch (error) {
      console.error("Error deleting data source:", error);
      throw error;
    }
  },
};
