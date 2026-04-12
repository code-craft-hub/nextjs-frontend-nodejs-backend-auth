"use client";

import { useState } from "react";
import { Download, Eye, FileDown, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useResumeDownload } from "@/hooks/resume/useResumeDownload";

interface ViewResumeProps {
  resumeId: string;
  hasOriginal: boolean;
  className?: string;
}

export function ViewResume({ resumeId, hasOriginal, className }: ViewResumeProps) {
  const [open, setOpen] = useState(false);
  const { preview, previewOriginal, isPreviewing, isPreviewingOriginal, isBusy, error } =
    useResumeDownload();

  const handlePreview = async (type: "parsed" | "original") => {
    if (type === "original") {
      await previewOriginal(resumeId);
    } else {
      await preview(resumeId);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" title="View resume" className={className}>
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Which version would you like to view?</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          {hasOriginal && (
            <Button
              variant="outline"
              className="justify-start gap-2"
              disabled={isBusy}
              onClick={() => handlePreview("original")}
            >
              {isPreviewingOriginal ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <Eye className="size-4" />
              )}
              Original Resume
            </Button>
          )}
          <Button
            variant="outline"
            className="justify-start gap-2"
            disabled={isBusy}
            onClick={() => handlePreview("parsed")}
          >
            {isPreviewing ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              <Eye className="size-4" />
            )}
            Parsed Resume
          </Button>
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DownloadResumeProps {
  resumeId: string;
  hasOriginal: boolean;
  originalName: string;
  fileName: string;
  className?: string;
}

export function DownloadResume({
  resumeId,
  hasOriginal,
  originalName,
  fileName,
  className,
}: DownloadResumeProps) {
  const [open, setOpen] = useState(false);
  const { download, downloadOriginal, isDownloading, isDownloadingOriginal, isBusy, error } =
    useResumeDownload();

  const handleDownload = async (type: "parsed" | "original") => {
    if (type === "original") {
      await downloadOriginal(resumeId, originalName);
    } else {
      await download(resumeId, fileName);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" title="Download resume" className={className}>
          <Download className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Which version would you like to download?</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          {hasOriginal && (
            <Button
              variant="outline"
              className="justify-start gap-2"
              disabled={isBusy}
              onClick={() => handleDownload("original")}
            >
              {isDownloadingOriginal ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <FileDown className="size-4" />
              )}
              Original Resume
            </Button>
          )}
          <Button
            variant="outline"
            className="justify-start gap-2"
            disabled={isBusy}
            onClick={() => handleDownload("parsed")}
          >
            {isDownloading ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Parsed Resume
          </Button>
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
