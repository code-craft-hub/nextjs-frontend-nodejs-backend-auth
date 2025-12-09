import {axiosApiClient} from "./axios/auth-api";

export const getUser = async () => {
  try {
    const { data } = await axiosApiClient.get("/users");
    return data;
  } catch (error: any) {
    throw new Error(error.error || "Login failed");
  }
};
