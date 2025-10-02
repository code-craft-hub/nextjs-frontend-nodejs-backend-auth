import { ArticleResponse } from "@/types";
import axios from "axios";
import apiClient from "../endpoints/cloud.run.endpoint";

/**
 * Fetches all articles from Strapi
 */
export async function fetchArticles() {
  try {
    const { data } = await apiClient.get<ArticleResponse>(
      "/blogs/blogs/public"
    );
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Health check
 */
export async function healthCheck() {
  try {
    const { data } = await axios.get<ArticleResponse>(
      "https://cverai-blog-server-865996551693.europe-west1.run.app"
    );
    return data;
  } catch (error) {
    console.error("Health check failed : ", error)
    throw handleApiError(error);
  }
}

/**
 * Centralized API error handler
 */
function handleApiError(error: unknown): Error {
  if (error instanceof Error) {
    return new Error(error.message);
  }
  return new Error("An unknown error occurred.");
}
