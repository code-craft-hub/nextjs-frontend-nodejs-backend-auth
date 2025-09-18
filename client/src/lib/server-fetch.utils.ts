import authClient from "./axios/auth-api";

  export const getUser = async () => {
    try {
      const { data } = await authClient.get("/profile");
      return data;
    } catch (error: any) {
      throw new Error(error.error || "Login failed");
    }
  }