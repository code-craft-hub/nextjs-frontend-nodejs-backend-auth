import { v4 as uuid } from "uuid";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TEducations, TWorkExperiences } from "@/types";
import {
  formatDistanceToNow,
  formatDistanceToNowStrict,
  isValid,
  Locale,
} from "date-fns";

export function formatDateString(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formattedDate} at ${time}`;
}

export const multiFormatDateString = (timestamp: string = ""): string => {
  const timestampNum = Math.round(new Date(timestamp).getTime() / 1000);
  const date: Date = new Date(timestampNum * 1000);
  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();
  const diffInSeconds: number = diff / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;
  const diffInDays: number = diffInHours / 24;

  switch (true) {
    case Math.floor(diffInDays) >= 30:
      return formatDateString(timestamp);
    case Math.floor(diffInDays) === 1:
      return `${Math.floor(diffInDays)} day ago`;
    case Math.floor(diffInDays) > 1 && diffInDays < 30:
      return `${Math.floor(diffInDays)} days ago`;
    case Math.floor(diffInHours) >= 1:
      return `${Math.floor(diffInHours)} hours ago`;
    case Math.floor(diffInMinutes) >= 1:
      return `${Math.floor(diffInMinutes)} minutes ago`;
    default:
      return "Just now";
  }
};

export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};

export function incrementWord(currentCount: number): number {
  if (currentCount < 5) {
    return currentCount + 1;
  }
  return currentCount;
}

export function formatString(input: string): string {
  let formattedString = input?.trim()?.toLowerCase();
  formattedString = formattedString?.replace(/\s+/g, "_");
  return formattedString;
}

export function filterObjectsByKeyName(
  objects: Record<string, any>
): Record<string, any> {
  const filteredObjects: Record<string, any> = {};

  for (const key in objects) {
    if (key.includes("Resume_")) {
      filteredObjects[key] = objects[key];
    }
  }

  return filteredObjects;
}

export function filterObjectsByDynamicValue(
  objects: Record<string, any> | string,
  dynamicValue: string
): Record<string, any> {
  const filteredObjects: Record<string, any> = {};
  if (typeof objects === "object") {
    for (const key in objects) {
      const modifiedKey = key.replace("Resume_", "");

      if (modifiedKey === dynamicValue) {
        filteredObjects[key] = objects[key];
      }
    }
  }

  return filteredObjects;
}

export function moveStringToFront<T extends string | any[]>(
  arr: T,
  str: string
): T {
  const index = arr.indexOf(str);
  if (index !== -1) {
    (arr as string[]).splice(index, 1);
    (arr as string[]).unshift(str);
  }
  return arr;
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export const geminiCall = async (
  prompt = "",
  geminiModel = "gemini-1.5-flash"
) => {
  const model = genAI.getGenerativeModel({ model: geminiModel });
  const result = await model.generateContent(prompt);
  return result.response.text();
};
export const geminiCallStream = async (
  prompt = "",
  geminiModel = "gemini-1.5-flash"
) => {
  const model = genAI.getGenerativeModel({ model: geminiModel });
  const result = await model.generateContentStream(prompt);
  return result;
};

export async function AIGeneration(
  systemContent = "",
  assistantContent = "",
  userContent = "",
  gptModel = "gpt-3.5-turbo"
) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemContent },
        { role: "assistant", content: assistantContent },
        { role: "user", content: userContent },
      ],
      model: gptModel, // Previous model was model: "gpt-3.5-turbo", model: "gpt-4o"
      stream: true,
    });
    return completion;
  } catch (error) {
    console.error(error);
  }
}
export async function NoneAIGenerationStream(
  systemContent = "",
  assistantContent = "",
  userContent = "",
  gptModel = "gpt-3.5-turbo"
) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemContent },
        { role: "assistant", content: assistantContent },
        { role: "user", content: userContent },
      ],
      model: gptModel, // Previous model was model: "gpt-3.5-turbo", model: "gpt-4o"
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error(error);
  }
}

export const parseDate = (newDate: any) => {
  if (!newDate) {
    return "";
  }
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  var myDate = new Date(newDate),
    month = myDate.getMonth(),
    year = myDate.getFullYear();
  const formattedDate = `${months[month]}, ${" "}  ${year}`;
  return formattedDate;
};
export const createPositionDateText = (
  startDate: any,
  endDate: any,
  isCurrent: boolean
): string => {
  const startDateText =
    getMonthFromInt(startDate.startMonth) + ". " + startDate.startYear;
  const endDateText = isCurrent
    ? "Present"
    : `${getMonthFromInt(endDate.endMonth)}. ${endDate.endYear}`;

  return `${startDateText} - ${endDateText}`;
};

export const getMonthFromInt = (value: number): string => {
  switch (value) {
    case 1:
      return "Jan";
    case 2:
      return "Feb";
    case 3:
      return "Mar";
    case 4:
      return "Apr";
    case 5:
      return "May";
    case 6:
      return "Jun";
    case 7:
      return "Jul";
    case 8:
      return "Aug";
    case 9:
      return "Sept";
    case 10:
      return "Oct";
    case 11:
      return "Nov";
    case 12:
      return "Dec";
    default:
      return "N/A";
  }
};

export function convertStringToArray(inputString: string) {
  // Split the input string into an array using newline as the delimiter
  const newArray = inputString.split(/\n/);

  // Remove empty strings and trim each item
  const finalArray = newArray
    .filter((item) => item.trim() !== "")
    .map((item) => item.trim());

  return finalArray;
}

export function limitCharacterCount(inputString: string, maxLength: number) {
  if (inputString.length <= maxLength) {
    // If the string is within the limit, return it as is
    return inputString;
  } else {
    // If the string exceeds the limit, slice it
    return inputString.slice(0, maxLength);
  }
}

export function processBackticks(inputString: string) {
  if (inputString === undefined) {
    return [];
  }

  if (Array.isArray(inputString)) {
    return inputString;
  }
  try {
    // const plainTextReg = /(?<=\[|\s*,\s*)([^,"\[\]\s][^,\[\]]*)(?=\s*,|\s*\])/;
    // if (plainTextReg.test(inputString)) {
    // }
    const startIndex = inputString?.indexOf("[");
    const endIndex = inputString?.lastIndexOf("]");
    if (startIndex !== -1 && endIndex !== -1) {
      const content = inputString?.substring(startIndex, endIndex + 1);
      const checkReg = /(\d+)?/g;
      // const checkReg = /(\n)?(\d+)?(\.\s*)?/g;
      const cleanedContent = content.replace(checkReg, "");
      const result = JSON.parse(cleanedContent);
      return result;
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}
export function saveJsonParserCurlyBraces(inputString: string) {
  if (inputString === undefined) {
    return [];
  }

  if (Array.isArray(inputString)) {
    return inputString;
  }
  try {
    const startIndex = inputString?.indexOf("{");
    const endIndex = inputString?.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1) {
      const content = inputString?.substring(startIndex, endIndex + 1);
      return JSON.parse(content);
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}
export function saveJsonParserSquareBrackets(inputString: string) {
  if (inputString === undefined) {
    return [];
  }

  if (Array.isArray(inputString)) {
    return inputString;
  }
  try {
    const startIndex = inputString?.indexOf("[");
    const endIndex = inputString?.lastIndexOf("]");
    if (startIndex !== -1 && endIndex !== -1) {
      const content = inputString?.substring(startIndex, endIndex + 1);
      return JSON.parse(content);
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}
export function workArrayParsed(inputString: string) {
  if (inputString === undefined) {
    return [];
  }

  if (Array.isArray(inputString)) {
    return inputString;
  }
  try {
    const startIndex = inputString?.indexOf("[");
    const endIndex = inputString?.lastIndexOf("]");
    if (startIndex !== -1 && endIndex !== -1) {
      const content = inputString?.substring(startIndex, endIndex + 1);
      const parsedArray: TWorkExperiences[] = JSON.parse(content);
      const parseArrayIdUpdated = parsedArray?.map((work) => ({
        ...work,
        workID: uuid(),
        jobStart: monthYear(work.jobStart),
        jobEnd: monthYear(work.jobEnd),
      }));
      return parseArrayIdUpdated;
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function educationArrayParsed(inputString: string) {
  if (inputString === undefined) {
    return [];
  }

  if (Array.isArray(inputString)) {
    return inputString;
  }
  try {
    const startIndex = inputString?.indexOf("[");
    const endIndex = inputString?.lastIndexOf("]");
    if (startIndex !== -1 && endIndex !== -1) {
      const content = inputString?.substring(startIndex, endIndex + 1);
      const parsedArray: TEducations[] = JSON.parse(content);
      const parseArrayIdUpdated = parsedArray?.map((edu) => ({
        ...edu,
        EduID: uuid(),
        educationStart: monthYear(edu.educationStart),
        educationEnd: monthYear(edu.educationEnd),
      }));
      return parseArrayIdUpdated;
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function formatTextDate(dateString: any) {
  // Parse the date string
  const dateParts = dateString.split(" ");
  const month = dateParts[0];
  const year = dateParts[1];

  // Create a Date object with the first day of the month
  const date = new Date(`${month} 1, ${year}`);

  // Extract the year, month, and day
  const yearNumeric = date.getFullYear();
  const monthNumeric = ("0" + (date.getMonth() + 1)).slice(-2); // Add leading zero
  const dayNumeric = ("0" + date.getDate()).slice(-2); // Add leading zero

  // Format the date as YYYY-MM-DD
  return `${yearNumeric}-${monthNumeric}-${dayNumeric}`;
}

export function removeQuotes(str: string) {
  if (str.includes('"')) {
    return str.replace(/"/g, ""); // Remove double quotes from the title
  }
  if (str.includes("'")) {
    return str.replace(/'/g, ""); // Remove single quotes from the title
  }
  if (str.includes("/")) {
    return str.replace(/\//g, ""); // Remove slash quotes from the title
  }
  return str;
}

export function TodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  const formattedTime = `${hours}:${minutes}:${seconds}`;

  return { currentDate: formattedDate, currentTime: formattedTime };
}

export function convertDateToWords(dateString: string) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();

  const ordinalSuffix = (day: any) => {
    if (day > 3 && day < 21) return "th"; // Handle 11th to 20th
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${month} ${day}${ordinalSuffix(day)}, ${year}`;
}
export const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

export const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

export const readableDate = (today: string) => {
  const d = new Date(today);
  return {
    year: d?.getFullYear(),
    month: d?.getMonth() + 1,
    day: d?.getDate(),
    monthName: monthNames[d?.getMonth()],
    dayName: dayNames[d?.getDay()],
  };
};

export const userYear = (year: any) => {
  const startYearRegex = /^\d{4}/;
  const YearAnyWhereRegex = /\d{4}/;

  let yearFormat: string | undefined | number;
  if (startYearRegex?.test(year)) {
    const match = year?.match(startYearRegex);
    if (match) {
      yearFormat = match[0];
      return yearFormat;
    }
  } else if (YearAnyWhereRegex?.test(year)) {
    const match = year?.match(YearAnyWhereRegex);
    if (match) {
      yearFormat = match[0];
      return yearFormat;
    }
  } else {
    yearFormat = new Date()?.getFullYear();
    return yearFormat;
  }
};

type QAprops =
  | {
      [x: string]: string | number;
      id: number;
    }[]
  | string
  | undefined;

export const QARegex = (data: QAprops) => {
  // Improved regex pattern
  if (data === undefined) return;
  if ("object" === typeof data) return;
  let regex =
    /(Q(\s*)?(\d*)?(\s*)?:\s*[^A]*?|A(\s*)?(\d*)?(\s*)?[^Q]*?)(?=(Q(\s*)?(\d*)?(\s*)?:|A(\s*)?(\d*)?(\s*)?:|$))/gs;
  // let regex = /(Q\d+:\s*[^A]*?|A\d+:\s*[^Q]*?)(?=(Q\d+:|A\d+:|$))/gs;
  let matches = [...data?.matchAll(regex)];

  const matchesFound = matches?.map((match, index) => {
    let [key, ...value] = match[0].split(":");
    return { id: index, [key.trim()]: value.join(":").trim() };
  });

  return matchesFound;
};

export const removeSpaceUnderscore = (data: string) => {
  return data?.replace(/_?"?/g, "");
};

export const stripeSpecialCharacters = (text?: string) => {
  if (text === undefined) return;
  const regTest = /[a-zA-Z\s]+/g;
  let result = text?.match(regTest)?.join(" ").trim();
  return result as string;
};

export const createdAt = () => {
  return new Date().toISOString().split("T")[0];
};

export const FireBaseTime = (timestamp: any) => {
  const seconds = timestamp.seconds * 1000;
  const nanoseconds = timestamp.nanoseconds / 1e6;
  return new Date(seconds + nanoseconds);
};
const Qregex = /Q\s*\d*\s*:/g;
const Aregex = /A\s*\d*\s*:/g;

export function organizeQA(data: string[]): { Q: string; A: string }[] {
  return data.reduce<{ Q: string; A: string }[]>((acc, item, index) => {
    if (index % 2 === 0) {
      acc.push({ Q: item?.trim()?.replace(Qregex, "")?.trim(), A: "" });
    } else {
      acc[acc.length - 1].A = item?.trim()?.replace(Aregex, "")?.trim();
    }
    return acc;
  }, []);
}

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
export function customDate({
  input = new Date(),
  year = "numeric",
  month = "long",
  day = "numeric",
}: {
  input?: string | Date;
  year?: "numeric" | "2-digit" | undefined;
  month?: "2-digit" | "long" | "numeric" | "narrow" | "short" | undefined;
  day?: "numeric" | "2-digit" | undefined;
}) {
  const validDate = validateOrCreateDate(input);
  return String(
    validDate?.toLocaleDateString("en-US", {
      year, // 2-digit, numeric
      month, // 2-digit, long, numeric, narrow,short
      day, // 2-digit, numeric
    })
  );
}

export const handleCheckout = async ({ dbUser, price }: any) => {
  const apiKey = process.env.NEXT_LEMON_SQUEEZY_API_KEY;
  const redirectUrl = process.env.NEXT_LEMON_SQUEEZY_REDIRECT;

  try {
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            store_id: 457610, //139892
            variant_id: 703347,
            checkout_data: {
              email: dbUser?.email,
              name: dbUser?.firstName || dbUser?.lastName,
            },
            product_options: {
              redirect_url: `${redirectUrl}/dashboard/credit?lemon=success&price=${price}`,
              receipt_button_text: "Go to your account",
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: "139892",
              },
            },
            variant: {
              data: {
                type: "variants",
                id: "631767",
              },
            },
          },
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.errors?.[0]?.detail || "API request failed");
    }
    if (result?.data?.attributes?.url) {
      window.location.href = result.data.attributes.url;
    } else {
      throw new Error("Checkout URL not found in response");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    throw error;
  }
};

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

export const removeHash = (text: string): string => {
  return text?.replace(/(###|####|##|#)/gi, "");
};
export function normalizeToString(input: any): string {
  // Handle null/undefined cases
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

// Alternative version that specifically looks for a target field
export function extractTextFromField(
  input: any,
  fieldName: string = "summary"
): string {
  if (input == null) {
    return "";
  }

  // If input is a string, try to parse it as JSON
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      return input;
    }

    try {
      const parsed = JSON.parse(input);
      return extractTextFromField(parsed, fieldName);
    } catch {
      return input;
    }
  }

  // Handle arrays
  if (Array.isArray(input)) {
    for (const item of input) {
      const result = extractTextFromField(item, fieldName);
      if (result) return result;
    }
    return "";
  }

  // Handle objects
  if (typeof input === "object" && input !== null) {
    // Look for the specific field
    if (input.hasOwnProperty(fieldName)) {
      const value = input[fieldName];
      if (typeof value === "string") {
        return value;
      }
      return extractTextFromField(value, fieldName);
    }

    // If field not found, search recursively in nested objects
    for (const key in input) {
      if (typeof input[key] === "object") {
        const result = extractTextFromField(input[key], fieldName);
        if (result) return result;
      }
    }
  }

  return String(input);
}

export function safeFormatDistanceToNow(inputDate: unknown): string {
  let date: Date;

  if (inputDate instanceof Date && !isNaN(inputDate.getTime())) {
    date = inputDate;
  } else if (typeof inputDate === "string" || typeof inputDate === "number") {
    const parsed = new Date(inputDate);
    date = isNaN(parsed.getTime()) ? new Date() : parsed;
  } else {
    date = new Date(); // fallback
  }

  return formatDistanceToNow(date, { addSuffix: true });
}

export const getValidPhoneFromStorage = (): string | null => {
  const phone = localStorage?.getItem("phoneParam");
  if (!phone) return null;

  // Example: match at least 10 digits (customize as needed)
  const isValid = /^\+?[0-9]{7,15}$/.test(phone.trim());

  return isValid ? phone.trim() : null;
};

export function parseUntilObjectOrArray(input: any) {
  try {
    if (!input) return input;
    let parsed = input;

    if (typeof parsed === "object") return input;

    // Recursively parse while it's a string
    while (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }

    // Only return if it's an object or array
    if (
      parsed !== null &&
      (Array.isArray(parsed) || typeof parsed === "object")
    ) {
      return parsed;
    }

    throw new Error("Parsed value is not an object or array.");
  } catch (error) {
    console.error("Failed to parse input recursively:", error);
    throw error;
  }
}

/**
 * Safely formats a Firestore timestamp ({ _seconds, _nanoseconds }) into a human-readable relative time string.
 * Defaults to something like: "3 days ago", "1 hour ago", "just now".
 *
 * @param {{_seconds: number, _nanoseconds?: number}|null|undefined} ts - Firestore timestamp object.
 * @param {Object} [opts]
 * @param {boolean} [opts.addPrefix=true] - Whether to include the trailing "ago"/"in" (e.g., "3 days ago").
 * @param {string} [opts.fallback='unknown'] - String to return if input is invalid.
 * @param {boolean} [opts.strict=true] - Pass true to use strict distance (no rounding to largest unit).
 * @param {string} [opts.label='Updated'] - Prefix label, e.g., "Updated 3 days ago".
 * @param {string} [opts.locale] - Optional date-fns locale object (must be imported separately if used).
 * @returns {string}
 */
interface FormatFirestoreRelativeOptions {
  addPrefix?: boolean;
  strict?: boolean;
  label?: string;
  locale?: Locale;
}
export function formatFirestoreRelative(
  ts: any,
  opts: FormatFirestoreRelativeOptions = {}
) {
  const {
    addPrefix = true,
    strict = true,
    label = "",
    locale = undefined, // expects a date-fns locale object if provided
  } = opts;

  try {
    if (!ts || typeof ts._seconds !== "number")
      return customDate({ input: new Date() });

    const nanoseconds =
      typeof ts._nanoseconds === "number" ? ts._nanoseconds : 0;

    // Convert to milliseconds safely (avoid floating issues)
    const millis = ts._seconds * 1000 + Math.floor(nanoseconds / 1e6);

    const date = new Date(millis);
    if (!isValid(date)) return customDate({ input: new Date() });

    // If the difference is very small, return "just now"
    const deltaMs = Date.now() - date.getTime();
    if (Math.abs(deltaMs) < 5 * 1000) {
      // less than ~5 seconds
      return label ? `${label} just now` : "just now";
    }

    const distanceFn = strict
      ? formatDistanceToNowStrict
      : formatDistanceToNowStrict; // could swap to formatDistance for non-strict if desired

    const distance = distanceFn(date, {
      addSuffix: addPrefix,
      locale,
    });

    // Assemble final string
    if (label) {
      // If addPrefix is true, distance already contains "ago" or "in X", so we don't duplicate.
      return `${label} ${distance}`;
    }
    return distance;
  } catch (err) {
    return formatDistanceToNowStrict(new Date());
  }
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

export const isValidEmail = (email?: string): boolean => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};


