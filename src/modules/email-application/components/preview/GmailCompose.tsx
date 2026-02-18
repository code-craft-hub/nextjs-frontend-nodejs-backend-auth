"use client";

import { Button } from "@/components/ui/button";

interface GmailComposeProps {
  coverLetterData?: {
    title?: string;
    salutation?: string;
    coverLetter?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
  recruiterEmail: string;
}

/**
 * GmailCompose Component
 * Opens Gmail compose with pre-filled cover letter content
 * Copies content to clipboard for easy pasting
 */
export const GmailCompose = ({
  coverLetterData,
  recruiterEmail,
}: GmailComposeProps) => {
  const handleSend = async () => {
    const to = recruiterEmail || "";
    const subject = coverLetterData?.title || "";
    const body = buildEmailBody(coverLetterData);

    const composeUrl = new URL("https://mail.google.com/mail/");
    composeUrl.searchParams.set("view", "cm");
    composeUrl.searchParams.set("fs", "1");
    if (to) composeUrl.searchParams.set("to", to);
    if (subject) composeUrl.searchParams.set("su", subject);
    if (body) composeUrl.searchParams.set("body", body + "\n\n");

    // Open Gmail compose in new window
    const window_ = window.open(
      composeUrl.toString(),
      "_blank",
      "noopener,noreferrer",
    );

    // Copy body to clipboard for easy pasting
    try {
      await navigator.clipboard.writeText(body);
    } catch {
      // Silently fail - clipboard may be unavailable in some contexts
    }

    // Focus new window
    if (window_) window_.focus();

    // Scroll to top to show any UI feedback
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Button variant="ghost" onClick={handleSend} aria-label="Send via Gmail">
      <img src="/gmail.svg" className="size-8" alt="Gmail Logo" />
    </Button>
  );
};

/**
 * Builds email body from cover letter data
 */
function buildEmailBody(data?: GmailComposeProps["coverLetterData"]): string {
  if (!data) return "";

  const salutation = data.salutation || "Dear Hiring Manager,";
  const content = data.coverLetter || "";
  const firstName = data.firstName || "";
  const lastName = data.lastName || "";
  const phone = data.phoneNumber || "";

  return (
    `${salutation}\n\n${content}\n\nSincerely,\n${firstName} ${lastName}` +
    (phone ? `\n${phone}` : "")
  );
}
