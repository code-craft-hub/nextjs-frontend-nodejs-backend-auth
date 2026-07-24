"use client";

import { resumeApi } from "@/features/resume";
import { useState } from "react";

type ActionState = "idle" | "downloading" | "previewing" | "downloading-original" | "previewing-original";

// async function fetchResumePdf(resumeId: string): Promise<Blob> {
//   const res = await fetch(`/api/admin/resumes/${resumeId}/download`);

//   if (!res.ok) {
//     const body = await res.json().catch(() => ({}));
//     throw new Error(
//       (body as { error?: string }).error ?? `Failed to fetch PDF (HTTP ${res.status})`,
//     );
//   }

//   return res.blob();
// }

// Only these can be rendered inside a browser tab. Anything else (Word, RTF,
// ODT, …) must be downloaded — window.open would show a broken/blank viewer.
const INLINE_PREVIEWABLE = /^(application\/pdf|image\/|text\/)/i;

const EXT_BY_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/rtf": "rtf",
  "text/rtf": "rtf",
  "application/vnd.oasis.opendocument.text": "odt",
  "text/plain": "txt",
};

function extForBlob(blob: Blob): string {
  const type = blob.type.split(";")[0].trim().toLowerCase();
  return EXT_BY_MIME[type] ?? "bin";
}

function saveBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function useResumeDownload() {
  const [state, setState] = useState<ActionState>("idle");
  const [error, setError] = useState<string | null>(null);

  const download = async (resumeId: string, filename: string) => {
    setState("downloading");
    setError(null);

    try {
      const blob = await resumeApi.fetchResumePdf(resumeId);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download resume");
    } finally {
      setState("idle");
    }
  };

  const preview = async (resumeId: string) => {
    setState("previewing");
    setError(null);

    try {
      const blob = await resumeApi.fetchResumePdf(resumeId);
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      // Revoke after a delay to give the new tab time to load the blob
      setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to preview resume");
    } finally {
      setState("idle");
    }
  };

  const downloadOriginal = async (resumeId: string, filename: string) => {
    setState("downloading-original");
    setError(null);

    try {
      const blob = await resumeApi.fetchOriginalResume(resumeId);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download original resume",
      );
    } finally {
      setState("idle");
    }
  };

  const previewOriginal = async (resumeId: string, filename?: string) => {
    setState("previewing-original");
    setError(null);

    try {
      const blob = await resumeApi.fetchOriginalResume(resumeId);

      if (INLINE_PREVIEWABLE.test(blob.type)) {
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
      } else {
        // Word/RTF/ODT can't render in a tab — download instead of showing a
        // blank viewer. Use the real name when we have it, else a typed default.
        saveBlob(blob, filename || `original-resume.${extForBlob(blob)}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to preview original resume");
    } finally {
      setState("idle");
    }
  };

  return {
    download,
    preview,
    downloadOriginal,
    previewOriginal,
    isDownloading: state === "downloading",
    isPreviewing: state === "previewing",
    isDownloadingOriginal: state === "downloading-original",
    isPreviewingOriginal: state === "previewing-original",
    isBusy: state !== "idle",
    error,
  };
}
