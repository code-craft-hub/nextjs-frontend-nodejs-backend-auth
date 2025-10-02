import { ApiError } from '@/types';
import axios, { AxiosError, AxiosInstance } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BLOG_BACKEND_URL;


// WORK ON THE RESPONSE DELAY OF THE BACKEND SERVICE. E.G RENDER AND CLOUDRUN, They spin down to zero when they're not actively handling request

// Create Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  // headers: {
  //   'Content-Type': 'application/json',
  //   Authorization: `Bearer ${AUTH_TOKEN}`,
  // },
  timeout: 60000, // 60 seconds timeout
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You could refresh token logic here if needed
    // console.info(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    // console.info(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      console.error('[API Response Error]', {
        status: error.response.status,
        data: error.response.data,
        // url: error.config.url,
      });
    } else if (error.request) {
      console.error('[API No Response]', error.request);
    } else {
      console.error('[API Setup Error]', error.message);
    }
    return Promise.reject(error.response);
  }
);

export default apiClient;
