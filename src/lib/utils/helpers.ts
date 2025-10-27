import { formatDistanceToNow, isValid } from "date-fns";
import { ApiError, QAItem } from "@/types";
import { jsonrepair } from "jsonrepair";
import { MouseEvent } from "react";

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  if (secret.length === 0) {
    throw new Error("JWT_SECRET environment variable is empty");
  }

  if (secret.length < 32) {
    console.warn(
      `[WARNING] JWT_SECRET is only ${secret.length} characters. ` +
        "Recommended minimum is 32 characters for security."
    );
  }

  return secret;
};

export const smoothlyScrollToView = (
  e: MouseEvent<HTMLAnchorElement>,
  href: string
) => {
  e.preventDefault();
  const element = document.querySelector(href);
  if (element) {
    const offset = 70;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};

export const extractCompleteJsonObjects = (
  text: string
): {
  complete: QAItem[];
  remainder: string;
} => {
  const complete: QAItem[] = [];
  let remainder = text;

  // Try to find complete JSON objects by looking for newlines or complete braces
  const lines = text.split("\n");
  const incompleteLine: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed === "[DONE]") continue;

    // Remove markdown code blocks if present
    const cleaned = trimmed
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "");

    if (!cleaned) continue;

    // Check if line looks like it could be complete JSON (has opening and closing braces)
    const openBraces = (cleaned.match(/{/g) || []).length;
    const closeBraces = (cleaned.match(/}/g) || []).length;

    if (openBraces > 0 && openBraces === closeBraces) {
      // Looks complete, try to parse
      try {
        const parsed = JSON.parse(cleaned);
        if (parsed.type === "qa" && parsed.question && parsed.answer) {
          complete.push({
            question: parsed.question,
            answer: parsed.answer,
          });
        }
      } catch (e) {
        // Try to repair the JSON
        try {
          const repaired = jsonrepair(cleaned);
          const parsed = JSON.parse(repaired);
          if (parsed.type === "qa" && parsed.question && parsed.answer) {
            complete.push({
              question: parsed.question,
              answer: parsed.answer,
            });
          }
        } catch (repairError) {
          // Still incomplete, save for next iteration
          incompleteLine.push(line);
        }
      }
    } else {
      // Definitely incomplete
      incompleteLine.push(line);
    }
  }

  remainder = incompleteLine.join("\n");
  return { complete, remainder };
};

export const createApiError = (message: string, status?: number): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  return error;
};

export const randomPercentage = (number?: number) => {
  return Math.floor(Math.random() * ((number ?? 100) - 50 + 1) + 50) + " %";
};
export const randomNumber = (number?: number) => {
  return Math.floor(Math.random() * ((number ?? 100) - 50 + 1) + 50);
};

export function validateOrCreateDate(inputDate: string | Date): Date {
  const date = new Date(inputDate);
  if (isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}




export const humanDate = (input: any): string => {
  try {
    if (!input) return formatDistanceToNow(new Date(), { addSuffix: true });

    const date = input instanceof Date ? input : new Date(input);

    if (!isValid(date)) return formatDistanceToNow(new Date(), { addSuffix: true });

    // if(isNaN(date.getTime())) 

    return formatDistanceToNow(date, { addSuffix: true });
  } catch (err) {
    console.error("humanDate() failed with input:", input, err);
    return "Invalid date";
  }
};
export function monthYear(input: Date | string) {
  const validDate = validateOrCreateDate(input);
  return String(
    validDate?.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })
  );
}
export const formatCurrencyUSA = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
};
export const formatCurrencyNG = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
};

export function normalizeToString(input: any): string {
  if (input == null) {
    return "";
  }

  // If input is already a string, try to parse it as JSON
  if (typeof input === "string") {
    // Return as-is if it's already plain text (not JSON)
    const trimmed = input.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      return input;
    }

    try {
      const parsed = JSON.parse(input);
      return normalizeToString(parsed); // Recursively handle the parsed object
    } catch {
      // If JSON parsing fails, return the original string
      return input;
    }
  }

  // Handle arrays - extract from first element
  if (Array.isArray(input)) {
    if (input.length === 0) {
      return "";
    }
    return normalizeToString(input[0]);
  }

  // Handle objects
  if (typeof input === "object" && input !== null) {
    const keys = Object.keys(input);

    // Empty object
    if (keys.length === 0) {
      return "";
    }

    // Look for common text fields first
    const textFields = [
      "summary",
      "text",
      "content",
      "description",
      "message",
      "value",
    ];
    for (const field of textFields) {
      if (input.hasOwnProperty(field)) {
        return normalizeToString(input[field]);
      }
    }

    // Fallback to first available key
    const firstKey = keys[0];
    return normalizeToString(input[firstKey]);
  }

  // Handle primitives (numbers, booleans, etc.)
  return String(input);
}

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // Remove base64 prefix
    };
    reader.onerror = reject;
  });

/**
 * Format streaming content with proper markdown styling
 */
export const formatStreamContent = (content: string): string => {
  if (!content) return "";

  // Add spacing for better readability
  const formatted = content
    // Headers
    .replace(/^(#{1,6})\s+(.+)$/gm, "$1 $2\n")
    // Code blocks
    .replace(/```(\w+)?\n/g, "```$1\n")
    // Lists
    .replace(/^(\s*[-*+])\s+/gm, "$1 ")
    .replace(/^(\s*\d+\.)\s+/gm, "$1 ");

  return formatted;
};

/**
 * Calculate reading metrics
 */
export const getReadingMetrics = (content: string) => {
  const words = content.trim().split(/\s+/).length;
  const chars = content.length;
  const readingTime = Math.ceil(words / 200); // Assuming 200 words per minute

  return {
    words,
    chars,
    readingTime,
  };
};

/**
 * Syntax highlighting helper for code detection
 */
export const detectCodeBlocks = (content: string): boolean => {
  return /```[\s\S]*?```/.test(content);
};

/**
 * Extract title from content (first header)
 */
export const extractTitle = (content: string): string | null => {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : null;
};
export const processWorkExperience = (workExp: any) => {
  if (!workExp) return [];

  if (Array.isArray(workExp)) {
    return workExp;
  }

  if (typeof workExp === "object" && workExp.experience) {
    return workExp.experience;
  }

  if (typeof workExp === "object") {
    return [workExp];
  }

  return [];
};

export const processEducation = (education: any) => {
  if (!education) return [];

  if (Array.isArray(education)) {
    return education;
  }

  if (typeof education === "object" && education.degrees) {
    return education.degrees;
  }

  if (typeof education === "object") {
    return [education];
  }

  return [];
};

export const processSkills = (skills: any) => {
  if (!skills) return [];

  if (Array.isArray(skills)) {
    return skills;
  }

  if (typeof skills === "object") {
    // Handle different skill structures
    if (skills.hardSkill || skills.softSkill) {
      return [...(skills.hardSkill || []), ...(skills.softSkill || [])];
    }
    if (skills.technical || skills.soft) {
      return [...(skills.technical || []), ...(skills.soft || [])];
    }
  }

  return [];
};

export const processCertifications = (certification: any) => {
  if (!certification) return [];

  if (Array.isArray(certification)) {
    return certification;
  }

  if (typeof certification === "object" && certification.certification) {
    return certification.certification;
  }

  if (typeof certification === "object") {
    return [certification];
  }

  return [];
};

export const processProjects = (project: any) => {
  if (!project) return [];

  if (Array.isArray(project)) {
    return project;
  }

  if (typeof project === "object" && project.project) {
    return project.project;
  }

  if (typeof project === "object") {
    return [project];
  }

  return [];
};

export const createCoverLetterOrderedParams = (
  docId: string,
  jobDesc: string
) => {
  const params = new URLSearchParams();
  params.set("coverLetterId", docId);
  params.set("jobDescription", jobDesc);
  return params;
};
export const createResumeOrderedParams = (docId: string, jobDesc: string) => {
  const params = new URLSearchParams();
  params.set("documentId", docId);
  params.set("jobDescription", jobDesc);
  return params;
};

export const isValidArray = (arr: any): arr is any[] => {
  return Array.isArray(arr) && arr.length > 0;
};

/**
 * Parse responsibilities into array format
 */
export const parseResponsibilities = (responsibilities: any): string[] => {
  if (!responsibilities) return [];

  if (Array.isArray(responsibilities)) {
    return responsibilities;
  }

  if (typeof responsibilities === "string") {
    return responsibilities.includes(",")
      ? responsibilities
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean)
      : [responsibilities];
  }

  return [];
};

/**
 * Sanitize content by removing markdown code blocks and other artifacts
 */
export const sanitizeJSONContent = (content: string): string => {
  let sanitized = content.trim();

  // Remove markdown code blocks (```json ... ``` or ``` ... ```)
  sanitized = sanitized.replace(/^```(?:json)?\s*\n?/gm, "");
  sanitized = sanitized.replace(/\n?```\s*$/gm, "");

  // Remove leading/trailing backticks
  sanitized = sanitized.replace(/^`+|`+$/g, "");

  // Remove any BOM characters
  sanitized = sanitized.replace(/^\uFEFF/, "");

  return sanitized.trim();
};

/**
 * Check if content looks like it might be incomplete JSON
 */
export const isLikelyIncompleteJSON = (content: string): boolean => {
  const trimmed = content.trim();

  if (!trimmed) return true;
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) return true;

  // Count brackets/braces
  const openBrackets = (trimmed.match(/\[/g) || []).length;
  const closeBrackets = (trimmed.match(/\]/g) || []).length;
  const openBraces = (trimmed.match(/\{/g) || []).length;
  const closeBraces = (trimmed.match(/\}/g) || []).length;

  return openBrackets !== closeBrackets || openBraces !== closeBraces;
};

/**
 * Attempt to complete incomplete JSON arrays
 */
export const attemptJSONCompletion = (content: string): string => {
  let completed = content.trim();

  // If it starts with [ but doesn't end with ], try to close it
  if (completed.startsWith("[") && !completed.endsWith("]")) {
    // Remove trailing commas
    completed = completed.replace(/,\s*$/, "");

    // Count open braces in incomplete objects
    const openBraces = (completed.match(/\{/g) || []).length;
    const closeBraces = (completed.match(/\}/g) || []).length;

    // Close any open objects
    for (let i = 0; i < openBraces - closeBraces; i++) {
      completed += "}";
    }

    // Close the array
    completed += "]";
  }

  return completed;
};

export const parseJSONSafely = (
  rawContent: string,
  section: string,
  isComplete: boolean = false
): { success: boolean; data: any[]; shouldUpdate: boolean } => {
  // Sanitize first
  const content = sanitizeJSONContent(rawContent);

  if (!content || content === "[]") {
    return { success: true, data: [], shouldUpdate: false };
  }

  // Strategy 1: Native parse for valid JSON
  try {
    const parsed = JSON.parse(content);
    const data = Array.isArray(parsed) ? parsed : [];
    return { success: true, data, shouldUpdate: true };
  } catch (nativeError) {
    // Only log for completed sections
    if (isComplete) {
      console.debug(`[${section}] Native parse failed, attempting repair`);
    }
  }

  // Strategy 2: For incomplete JSON during streaming, try to complete it
  if (!isComplete && isLikelyIncompleteJSON(content)) {
    try {
      const completed = attemptJSONCompletion(content);
      const parsed = JSON.parse(completed);
      const data = Array.isArray(parsed) ? parsed : [];
      return { success: true, data, shouldUpdate: data.length > 0 };
    } catch (completionError) {
      // Expected for very incomplete data, skip silently
      return { success: false, data: [], shouldUpdate: false };
    }
  }

  // Strategy 3: Use jsonrepair for malformed but mostly complete JSON
  if (isComplete) {
    try {
      const repaired = jsonrepair(content);
      const parsed = JSON.parse(repaired);
      const data = Array.isArray(parsed) ? parsed : [];
      return { success: true, data, shouldUpdate: true };
    } catch (repairError) {
      console.error(
        `[${section}] JSON repair failed:`,
        repairError,
        "\nContent:",
        content.substring(0, 200)
      );
      return { success: false, data: [], shouldUpdate: false };
    }
  }

  // For streaming content that can't be parsed yet
  return { success: false, data: [], shouldUpdate: false };
};
