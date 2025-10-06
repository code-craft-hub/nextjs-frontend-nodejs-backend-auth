"use client";
import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Upload,
  FileText,
  FileCheck,
  Loader2,
  X,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================

const SUPPORTED_FILE_TYPES = {
  IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"],
  PDF: ["application/pdf"],
  WORD: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ],
  PLAINTEXT: ["text/plain"],
} as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type ExtractedResult = {
  text: string;
  fileName: string;
  fileType: string;
  extractedAt: Date;
};

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const formSchema = z.object({
  extractedText: z
    .string()
    .min(2, { message: "Please upload a document to extract text." })
    .max(50000, { message: "Extracted text exceeds maximum length." }),
  metadata: z
    .object({
      fileName: z.string(),
      fileType: z.string(),
      extractedAt: z.date(),
    })
    .optional(),
});

type FormSchema = z.infer<typeof formSchema>;

// ============================================================================
// UTILITY FUNCTIONS - Text Extraction Services
// ============================================================================

class TextExtractionService {
  /**
   * Validates file type and size before processing
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    const allSupportedTypes: string[] = [
      ...SUPPORTED_FILE_TYPES.IMAGE,
      ...SUPPORTED_FILE_TYPES.PDF,
      ...SUPPORTED_FILE_TYPES.WORD,
      ...SUPPORTED_FILE_TYPES.PLAINTEXT,
    ];

    if (!allSupportedTypes.includes(file.type)) {
      return {
        valid: false,
        error:
          "Unsupported file type. Please upload an image, PDF, TXT, or Word document.",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`,
      };
    }

    return { valid: true };
  }

  /**
   * Main orchestrator for text extraction based on file type
   */
  static async extractText(file: File): Promise<string> {
    if (SUPPORTED_FILE_TYPES.IMAGE.includes(file.type as any)) {
      return await this.extractFromImage(file);
    }

    if (SUPPORTED_FILE_TYPES.PDF.includes(file.type as any)) {
      return await this.extractFromPDF(file);
    }

    if (SUPPORTED_FILE_TYPES.WORD.includes(file.type as any)) {
      return await this.extractFromWord(file);
    }
    if (SUPPORTED_FILE_TYPES.PLAINTEXT.includes(file.type as any)) {
      return await file.text();
    }

    throw new Error("Unsupported file type");
  }

  /**
   * Extract text from images using Tesseract.js (OCR)
   * Tesseract.js provides client-side OCR with support for 100+ languages
   */
  private static async extractFromImage(file: File): Promise<string> {
    try {
      const { data } = await Tesseract.recognize(
        file,
        "eng", // Language code - can be extended to support multiple languages
        {
          logger: (m) => {
            // Optional: Log progress for better UX
            if (m.status === "recognizing text") {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
        }
      );

      if (!data.text || data.text.trim().length === 0) {
        throw new Error(
          "No text detected in image. The image may be blank or text quality is too low."
        );
      }

      return data.text;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown OCR error";
      throw new Error(`Failed to extract text from image: ${errorMessage}`);
    }
  }

  /**
   * Extract text from PDF using pdf.js
   * Handles both text-based and scanned PDFs
   */
  private static async extractFromPDF(file: File): Promise<string> {
    try {
      // Set worker path for PDF.js
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const textParts: string[] = [];

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        if (pageText.trim()) {
          textParts.push(`--- Page ${pageNum} ---\n${pageText}\n`);
        }
      }

      if (textParts.length === 0) {
        throw new Error(
          "No text found in PDF. This may be a scanned document requiring OCR, " +
            "or the PDF may be empty."
        );
      }

      return textParts.join("\n");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown PDF error";
      throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
    }
  }

  /**
   * Extract text from Word documents using mammoth.js
   */
  private static async extractFromWord(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });

          if (!result.value || result.value.trim().length === 0) {
            resolve(
              `[WORD DOCUMENT: ${file.name}]\n\n` +
                `No text content found in document or document is empty.`
            );
          } else {
            resolve(result.value);
          }
        } catch (error) {
          reject(new Error("Failed to extract text from Word document"));
        }
      };

      reader.onerror = () => reject(new Error("Failed to read Word document"));
      reader.readAsArrayBuffer(file);
    });
  }
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useDocumentExtraction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const processDocument = useCallback(
    async (file: File): Promise<ExtractedResult | null> => {
      setIsProcessing(true);
      setError(null);
      setCurrentFile(file);

      try {
        // Validate file
        const validation = TextExtractionService.validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Extract text
        const extractedText = await TextExtractionService.extractText(file);

        return {
          text: extractedText,
          fileName: file.name,
          fileType: file.type,
          extractedAt: new Date(),
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearFile = useCallback(() => {
    setCurrentFile(null);
    setError(null);
  }, []);

  return {
    processDocument,
    isProcessing,
    error,
    currentFile,
    clearError,
    clearFile,
  };
};

// ============================================================================
// FILE UPLOAD COMPONENT
// ============================================================================

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
  currentFile: File | null;
  onClearFile: () => void;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  disabled,
  currentFile,
  onClearFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      console.log("FileS", e.dataTransfer.files, "ARRAY : ", files);
      if (files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [disabled, onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  if (currentFile) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
        <div className="flex items-center gap-3">
          <FileCheck className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-sm">{currentFile.name}</p>
            <p className="text-xs text-slate-500">
              {(currentFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearFile}
          disabled={disabled}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300"}
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-blue-400"
        }
      `}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileInput}
        accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf,.doc,.docx"
        disabled={disabled}
      />
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center gap-3 ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <div className="flex gap-2">
          <ImageIcon className="w-8 h-8 text-slate-400" />
          <FileText className="w-8 h-8 text-slate-400" />
          <Upload className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">
            Drop your file here or click to browse
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supports: Images, PDF, Word documents (Max 10MB)
          </p>
        </div>
      </label>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AnyFormatToText = () => {
  const {
    processDocument,
    isProcessing,
    error,
    currentFile,
    clearError,
    clearFile,
  } = useDocumentExtraction();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      extractedText: "",
      metadata: undefined,
    },
  });

  const handleFileSelect = useCallback(
    async (file: File) => {
      clearError();
      const result = await processDocument(file);
      console.log("Extraction result", file, result);
      if (result) {
        form.setValue("extractedText", result.text, { shouldValidate: true });
        form.setValue("metadata", {
          fileName: result.fileName,
          fileType: result.fileType,
          extractedAt: result.extractedAt,
        });
        // form.trigger("extractedText"); USE THIS IF YOU WANT TO TRIGGER VALIDATION IMMEDIATELY OR USE THE {SHOULDVALIDATE: TRUE} OPTION IN SETVALUE ABOVE
      }
    },
    [processDocument, clearError, form]
  );

  const handleClearFile = useCallback(() => {
    clearFile();
    form.reset();
  }, [clearFile, form]);

  const onSubmit = useCallback((values: FormSchema) => {
    console.log("Form submitted with values:", values);
    // Handle submission - send to API, process further, etc.
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Document Text Extractor
        </h1>
        <p className="text-slate-600">
          Upload an image, PDF, or Word document to extract and edit its text
          content.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormLabel>Upload Document</FormLabel>
            <FileUploadZone
              onFileSelect={handleFileSelect}
              disabled={isProcessing}
              currentFile={currentFile}
              onClearFile={handleClearFile}
            />
            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing document...</span>
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <FormField
            control={form.control}
            name="extractedText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Extracted Text</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    placeholder="Extracted text will appear here..."
                    className="w-full min-h-[300px] p-3 border rounded-lg resize-y font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isProcessing}
                  />
                </FormControl>
                <FormDescription>
                  Edit the extracted text as needed before submission.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.getValues("metadata") && (
            <div className="text-xs text-slate-500 space-y-1 p-3 bg-slate-50 rounded">
              <p>
                <strong>File:</strong> {form.getValues("metadata")?.fileName}
              </p>
              <p>
                <strong>Type:</strong> {form.getValues("metadata")?.fileType}
              </p>
              <p>
                <strong>Extracted:</strong>{" "}
                {form.getValues("metadata")?.extractedAt.toLocaleString()}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isProcessing || !form.formState.isValid}
            className="w-full"
          >
            Submit Extracted Text
          </Button>
        </form>
      </Form>
    </div>
  );
};
