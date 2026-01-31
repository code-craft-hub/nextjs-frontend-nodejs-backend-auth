"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const GmailCompose = ({
  coverLetterData,
  recruiterEmail,
}: {
  coverLetterData?: any;
  recruiterEmail: string;
}) => {
  const [to] = useState(recruiterEmail || "");
  const [subject] = useState(coverLetterData?.title || "");
  const [body] = useState(() => {
    let body = `${coverLetterData?.salutation || "Dear Hiring Manager,"}\n\n`;
    body += coverLetterData?.coverLetter || "";
    body += `\n\nSincerely,\n${coverLetterData?.firstName || ""} ${coverLetterData?.lastName || ""}`;
    body += `\n ${coverLetterData?.phoneNumber}`;
    return body;
  });
  const [files] = useState<File[]>([]);

  async function handleSend() {
    // await handleCopyPdfToClipboard();
    // toast.success("Resume copied to clipboard. Please paste it in Gmail ✨");
    // return;
    const compUrl = new URL("https://mail.google.com/mail/");
    compUrl.searchParams.set("view", "cm");
    compUrl.searchParams.set("fs", "1");
    if (to) compUrl.searchParams.set("to", to);
    if (subject) compUrl.searchParams.set("su", subject);
    if (body) compUrl.searchParams.set("body", body + "\n\n");

    // Open Gmail compose in a new window/tab
    const win = window.open(
      compUrl.toString(),
      "_blank",
      "noopener,noreferrer",
    );

    // Try to copy body to clipboard so user can paste it into the compose box
    try {
      await navigator.clipboard.writeText(body);
    } catch (err) {
      // ignore clipboard errors
    }

    // Create downloadable links for files and copy their names to clipboard as fallback info
    if (files.length > 0) {
      const names = files.map((f) => f.name).join("\n");
      try {
        await navigator.clipboard.writeText(
          (body ? body + "\n\n" : "") + "Attachments:\n" + names,
        );
      } catch (_) {}
    }

    // Focus the new window so user can interact (may be blocked by browser popup blockers)
    if (win) win.focus();

    // Show short on-screen instructions by scrolling to top where the UI shows them
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // const handleDownload = async () => {
  //   try {
  //     setIsDownloading(true);
  //     setError(null);

  //     const response = await axios.post(
  //       baseURL + "/download-generated-resume",
  //       resumeData,
  //       {
  //         responseType: "blob", // Important: tells axios to expect binary data
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         withCredentials: true, // Include cookies for authentication if needed
  //       },
  //     );

  //     // Create a blob from the PDF data
  //     const blob = new Blob([response.data], { type: "application/pdf" });
  //     await navigator.clipboard.writeText(base64PdfString);
  //     toast.success("Resume copied (base64)");

  //   } catch (err) {
  //     console.error("Download error:", err);
  //     setError(
  //       axios.isAxiosError(err) && err.response?.data?.error
  //         ? err.response.data.error
  //         : "Failed to download resume. Please try again.",
  //     );
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };

// const handleCopyPdfToClipboard = async () => {
//   try {
//     setIsDownloading(true);
//     setError(null);

//     const response = await axios.post(
//       `${baseURL}/download-generated-resume`,
//       resumeData,
//       {
//         responseType: "blob",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         withCredentials: true,
//       },
//     );

//     const pdfBlob = new Blob([response.data], {
//       type: "application/pdf",
//     });

//     // 🔑 This is the magic
//     const clipboardItem = new ClipboardItem({
//       "application/pdf": pdfBlob,
//     });

//     await navigator.clipboard.write([clipboardItem]);

//     toast.success("Resume copied — paste it into Gmail ✨");
//   } catch (err) {
//     console.error("Clipboard PDF error:", err);

//     toast.error("Failed to copy resume");

//     setError(
//       axios.isAxiosError(err) && err.response?.data?.error
//         ? err.response.data.error
//         : "Failed to copy resume. Please try again.",
//     );
//   } finally {
//     setIsDownloading(false);
//   }
// };



  return (
    <Button
      variant={"ghost"}
      onClick={() => {
        handleSend();
      }}
    >
      <img src="/gmail.svg" className="size-8" />
    </Button>
  );
};
