import { ApiError } from '@/types';
import axios, { AxiosError, AxiosInstance } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_WHATSAPP_BACKEND_URL;


// WORK ON THE RESPONSE DELAY OF THE BACKEND SERVICE. E.G RENDER AND CLOUDRUN, They spin down to zero when they're not actively handling request

// Create Axios instance
export const whatsappApiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  // headers: {
  //   'Content-Type': 'application/json',
  //   Authorization: `Bearer ${AUTH_TOKEN}`,
  // },
  timeout: 60000, // 60 seconds timeout
});

// Request Interceptor
whatsappApiClient.interceptors.request.use(
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
whatsappApiClient.interceptors.response.use(
  (response) => {
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

export default whatsappApiClient;
