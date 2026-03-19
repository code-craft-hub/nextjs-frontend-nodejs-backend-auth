// lib/api/server.api.ts
import { api, FetchOptions } from './client';
import { cookies } from 'next/headers';

// Helper to get cookie string from Next.js cookies
async function getCookieString() {
  const cookieStore = await cookies();
  
  const cookieString = cookieStore
    .getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');
    
  return cookieString;
}

// Server-side API methods that automatically forward cookies
export const serverApi = {
  get: async <T>(endpoint: string, options?: Omit<FetchOptions, 'serverCookies'>) => {
      await getCookieString(); // ✅ Await here
    return api.get<T>(endpoint, { ...options });
  },
  
  post: async <T>(endpoint: string, data?: any, options?: Omit<FetchOptions, 'serverCookies'>) => {
    await getCookieString(); // ✅ Await here
    return api.post<T>(endpoint, data, { ...options });
  },
  
  put: async <T>(endpoint: string, data?: any, options?: Omit<FetchOptions, 'serverCookies'>) => {
    await getCookieString(); // ✅ Await here
    return api.put<T>(endpoint, data, { ...options });
  },
  
  patch: async <T>(endpoint: string, data?: any, options?: Omit<FetchOptions, 'serverCookies'>) => {
     await getCookieString(); // ✅ Await here
    return api.patch<T>(endpoint, data, { ...options });
  },
  
  delete: async <T>(endpoint: string, options?: Omit<FetchOptions, 'serverCookies'>) => {
    await getCookieString(); // ✅ Await here
    return api.delete<T>(endpoint, { ...options });
  },
};