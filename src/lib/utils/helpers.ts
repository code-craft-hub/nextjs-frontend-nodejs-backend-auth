import { MouseEvent } from "react";

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

export function validateOrCreateDate(inputDate: string | Date): Date {
  const date = new Date(inputDate);
  if (isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}

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
  if (!content) return '';

  // Add spacing for better readability
  let formatted = content
    // Headers
    .replace(/^(#{1,6})\s+(.+)$/gm, '$1 $2\n')
    // Code blocks
    .replace(/```(\w+)?\n/g, '```$1\n')
    // Lists
    .replace(/^(\s*[-*+])\s+/gm, '$1 ')
    .replace(/^(\s*\d+\.)\s+/gm, '$1 ');

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
    readingTime
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