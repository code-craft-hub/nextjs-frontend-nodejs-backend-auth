// lib/api/server.api.ts
import { api, FetchOptions } from './client';
import { cookies } from 'next/headers';

// Helper to get cookie string from Next.js cookies
async function getCookieString() {
  const cookieStore = await cookies();
  
  console.log('🔍 Retrieving cookies from Next.js cookie store');
  const cookieString = cookieStore
    .getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');
    
  console.log('📦 Server cookies:', cookieString ? 'present' : 'missing');
  return cookieString;
}

// Server-side API methods that automatically forward cookies
export const serverApi = {
  get: async <T>(endpoint: string, options?: Omit<FetchOptions, 'serverCookies'>) => {
    const serverCookies = await getCookieString(); // ✅ Await here
    return api.get<T>(endpoint, { ...options, serverCookies });
  },
  
  post: async <T>(endpoint: string, data?: any, options?: Omit<FetchOptions, 'serverCookies'>) => {
    const serverCookies = await getCookieString(); // ✅ Await here
    return api.post<T>(endpoint, data, { ...options, serverCookies });
  },
  
  put: async <T>(endpoint: string, data?: any, options?: Omit<FetchOptions, 'serverCookies'>) => {
    const serverCookies = await getCookieString(); // ✅ Await here
    return api.put<T>(endpoint, data, { ...options, serverCookies });
  },
  
  patch: async <T>(endpoint: string, data?: any, options?: Omit<FetchOptions, 'serverCookies'>) => {
    const serverCookies = await getCookieString(); // ✅ Await here
    return api.patch<T>(endpoint, data, { ...options, serverCookies });
  },
  
  delete: async <T>(endpoint: string, options?: Omit<FetchOptions, 'serverCookies'>) => {
    const serverCookies = await getCookieString(); // ✅ Await here
    return api.delete<T>(endpoint, { ...options, serverCookies });
  },
};