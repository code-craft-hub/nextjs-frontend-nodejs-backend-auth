// lib/query/normalize-filters.ts
import type { JobFilters } from '@/lib/types/jobs';

export function normalizeJobFilters(filters: JobFilters): JobFilters {
  // Remove undefined/null values to ensure consistent keys
  const normalized: Record<string, any> = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      normalized[key] = value;
    }
  });
  
  // Always include required fields with defaults
  return {
    page: normalized.page ?? 1,
    limit: normalized.limit ?? 20,
    ...(normalized.search && { search: normalized.search }),
    ...(normalized.status && { status: normalized.status }),
    ...(normalized.locationType && { locationType: normalized.locationType }),
  };
}