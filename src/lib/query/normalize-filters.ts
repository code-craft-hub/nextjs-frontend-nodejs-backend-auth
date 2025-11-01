// lib/query/normalize-filters.ts
import type { JobFilters } from "@/lib/types/jobs";

/**
 * Normalizes job filters by removing empty values and ensuring consistent structure
 * @param filters - Raw filter object with potential undefined/null/empty values
 * @returns Normalized filter object with only valid values
 */
export function normalizeJobFilters(filters: Record<any, any>) : any{
  const normalized: Record<string | number, string> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (isValidFilterValue(value)) {
      normalized[key as keyof JobFilters] = value;
    }
  });

  // Ensure default values for required fields
  return {
    page: normalized.page ? Number(normalized.page) : 1,
    limit: normalized.limit ? Number(normalized.limit) : 20,
    ...normalized, // Spread all other valid keys
  };
}

/**
 * Determines if a filter value is valid (not empty)
 */
function isValidFilterValue(value: unknown): boolean {
  // Null or undefined
  if (value === null || value === undefined) {
    return false;
  }

  // Empty string
  if (typeof value === "string" && value.trim() === "") {
    return false;
  }

  // Empty array
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  ) {
    return false;
  }

  // Number 0 is valid
  if (typeof value === "number") {
    return true;
  }

  // Boolean false is valid
  if (typeof value === "boolean") {
    return true;
  }

  return true;
}

// // lib/query/normalize-filters.ts
// import type { JobFilters } from "@/lib/types/jobs";

// export function normalizeJobFilters(filters: JobFilters): JobFilters {
//   // Remove undefined/null values to ensure consistent keys
//   const normalized: Record<string, any> = {};

//   Object.entries(filters).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== "") {
//       normalized[key] = value;
//     }
//   });

//   return {
//     page: normalized.page ?? 1,
//     limit: normalized.limit ?? 20,
//     ...(normalized.title && { title: normalized.title }),
//     ...(normalized.bookmarkedIds && {
//       bookmarkedIds: normalized.bookmarkedIds,
//     }),
//     ...(normalized.searchValue && { searchValue: normalized.searchValue }),
//     ...(normalized.search && { search: normalized.search }),
//     ...(normalized.status && { status: normalized.status }),
//     ...(normalized.locationType && { locationType: normalized.locationType }),
//   };
// }
