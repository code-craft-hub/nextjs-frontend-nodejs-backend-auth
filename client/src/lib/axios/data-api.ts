import {
  createApiClient,
  setupInterceptors,
  createApiMethods,
  createUploadMethod,
  ApiMethods,
} from "./base";

// Create data API client
const dataClient = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_DATA_API_URL || "http://localhost:3002/api",
  timeout: 10000,
  withCredentials: true, // Include httpOnly cookies
});

// Setup common interceptors
setupInterceptors(dataClient, "DATA");

// Data API specific interceptors
dataClient.interceptors.request.use((config) => {
  // Add API key if available
  const apiKey = process.env.NEXT_PUBLIC_DATA_API_KEY;
  if (apiKey) {
    config.headers["X-API-Key"] = apiKey;
  }

  // Add version header
  config.headers["X-API-Version"] = "1.0";

  return config;
});

dataClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle data API specific errors
    if (error.response?.status === 429) {
      console.warn("[DATA] Rate limit exceeded");
      // Could implement retry logic here
    }
    return Promise.reject(error);
  }
);

// Create API methods
const dataMethods = createApiMethods(dataClient);
const uploadFile = createUploadMethod(dataClient);

// Data-specific extended API
interface DataAPI extends ApiMethods {
  // Users
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => Promise<any>;
  getUserById: (id: string) => Promise<any>;
  createUser: (userData: any) => Promise<any>;
  updateUser: (id: string, userData: any) => Promise<any>;
  deleteUser: (id: string) => Promise<any>;

  // Posts/Content
  getPosts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
  }) => Promise<any>;
  getPostById: (id: string) => Promise<any>;
  createPost: (postData: any) => Promise<any>;
  updatePost: (id: string, postData: any) => Promise<any>;
  deletePost: (id: string) => Promise<any>;

  // Categories
  getCategories: () => Promise<any>;
  createCategory: (categoryData: any) => Promise<any>;

  // File operations
  uploadFile: (
    file: File,
    onProgress?: (percent: number) => void
  ) => Promise<any>;
  deleteFile: (fileId: string) => Promise<any>;

  // Bulk operations
  bulkDelete: (ids: string[]) => Promise<any>;
  bulkUpdate: (updates: Array<{ id: string; data: any }>) => Promise<any>;
}

export const dataAPI: DataAPI = {
  ...dataMethods,
      getUsers: (params) => dataMethods.get("/users", { params }),
  getUserById: (id) => dataMethods.get(`/users/${id}`),
  createUser: (userData) => dataMethods.post("/users", userData),
  updateUser: (id, userData) => dataMethods.put(`/users/${id}`, userData),
  deleteUser: (id) => dataMethods.delete(`/users/${id}`),

  // Post/Content management
  getPosts: (params) => dataMethods.get("/posts", { params }),
  getPostById: (id) => dataMethods.get(`/posts/${id}`),
  createPost: (postData) => dataMethods.post("/posts", postData),
  updatePost: (id, postData) => dataMethods.put(`/posts/${id}`, postData),
  deletePost: (id) => dataMethods.delete(`/posts/${id}`),

  // Categories
  getCategories: () => dataMethods.get("/categories"),
  createCategory: (categoryData) =>
    dataMethods.post("/categories", categoryData),

  // File operations
  uploadFile: (file, onProgress) => uploadFile("/upload", file, onProgress),
  deleteFile: (fileId) => dataMethods.delete(`/files/${fileId}`),

  // Bulk operations
  bulkDelete: (ids) => dataMethods.post("/bulk/delete", { ids }),
  bulkUpdate: (updates) => dataMethods.post("/bulk/update", { updates }),
};

export default dataClient;
