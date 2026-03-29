/**
 * Interview Question Formatter Utility
 * Parses and structures interview questions with answers
 */

export interface InterviewQuestion {
  number: number;
  question: string;
  exemplaryAnswer: string;
}

export interface ParsedInterviewData {
  questions: InterviewQuestion[];
  totalQuestions: number;
  company: string;
  role: string;
}

/**
 * Extracts the company name and role from the first line of text
 */
function extractMetadata(text: string): { company: string; role: string } {
  const metadataMatch = text.match(
    /Here are \d+ interview questions tailored to the (.+?)(?: at (.+?))?(?:, along|$)/i
  );

  if (metadataMatch) {
    return {
      role: metadataMatch[1]?.trim() || "Software Engineer",
      company: metadataMatch[2]?.trim() || "Canonical",
    };
  }

  return { role: "Software Engineer", company: "Canonical" };
}

/**
 * Parses interview questions from formatted text
 * Expected format: numbered questions with "Exemplary Answer:" prefix
 */
function parseQuestions(text: string): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];

  // Match pattern: number. question text ... Exemplary Answer: "answer text"
  const questionPattern =
    /(\d+)\.\s+([^]*?)(?=Exemplary Answer:|(?:\n\d+\.|$))/gi;
  const answerPattern = /Exemplary Answer:\s*"([^]*?)(?="\n\n|\n\d+\.|\n$)/gi;

  const questionMatches = Array.from(text.matchAll(questionPattern));
  const answerMatches = Array.from(text.matchAll(answerPattern));

  for (let i = 0; i < questionMatches.length; i++) {
    const questionMatch = questionMatches[i];
    const answerMatch = answerMatches[i];

    if (questionMatch && answerMatch) {
      const number = parseInt(questionMatch[1], 10);
      const question = questionMatch[2].trim();
      const answer = answerMatch[1].trim();

      questions.push({
        number,
        question,
        exemplaryAnswer: answer,
      });
    }
  }

  return questions;
}

/**
 * Formats raw interview text into structured data
 * @param rawText - The raw interview questions text
 * @returns Parsed and structured interview data
 */
export function formatInterviewData(rawText: string): ParsedInterviewData {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Invalid input: expected non-empty string");
  }

  const metadata = extractMetadata(rawText);
  const questions = parseQuestions(rawText);

  if (questions.length === 0) {
    throw new Error("No interview questions found in provided text");
  }

  return {
    questions,
    totalQuestions: questions.length,
    company: metadata.company,
    role: metadata.role,
  };
}

/**
 * Highlights key phrases in text (e.g., "open source", "remote", "culture")
 */
export function highlightKeyPhrases(text: string): string {
  const keyPhrases = [
    "open source",
    "remote",
    "culture",
    "Linux",
    "Ubuntu",
    "cloud",
    "security",
    "collaborative",
    "community",
    "OWASP",
  ];

  let highlighted = text;
  keyPhrases.forEach((phrase) => {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    highlighted = highlighted.replace(
      regex,
      `<mark class="font-semibold text-blue-600 dark:text-blue-400 bg-transparent">${phrase}</mark>`
    );
  });

  return highlighted;
}

/**
 * Extracts summary from question text (first sentence)
 */
export function extractSummary(questionText: string): string {
  const firstSentence = questionText.match(/[^.!?]*[.!?]/)?.[0] || questionText;
  return firstSentence.trim().substring(0, 100) + (questionText.length > 100 ? "..." : "");
}

/**
 * Sanitizes HTML entities in text
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}