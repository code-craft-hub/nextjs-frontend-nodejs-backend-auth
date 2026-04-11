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

  const previewOriginal = async (resumeId: string) => {
    setState("previewing-original");
    setError(null);

    try {
      const blob = await resumeApi.fetchOriginalResume(resumeId);
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
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
