import { ProfileData, ProfileResponse } from "../types";
import { api } from "./client";

export const BACKEND_API_VERSION = "v1";

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
      payload.profileData,
    );
    return data;
  },

  setDefaultDataSource: async ({
    profileId,
  }: {
    profileId: string;
  }): Promise<ProfileResponse> => {
    const data = await api.patch<ProfileResponse>(
      `/users/set-default-data-source`,
      { profileId },
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
      },
    );
    return data;
  },
  deleteDataSource: async (): Promise<ProfileResponse> => {
    try {
      const data = await api.delete<ProfileResponse>(
        "/users/delete-data-source",
      );
      return data;
    } catch (error) {
      console.error("Error deleting data source:", error);
      throw error;
    }
  },

  // GCS
  deleteDataSourceWithGCS: async ({ profileId }: { profileId: string }) => {
    try {
      await api.delete<ProfileResponse>(
        `/${BACKEND_API_VERSION}/resume/${profileId}/hard-delete`,
      );
    } catch (error) {
      console.error("Error deleting data source:", error);
      throw error;
    }
  },
};
