
"use client";
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, FileText, FileCheck, Loader2, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

const formSchema = z.object({
  extractedText: z
    .string()
    .min(1, { message: 'Please upload a document to extract text.' })
    .max(50000, { message: 'Extracted text exceeds maximum length.' }),
  metadata: z
    .object({
      fileName: z.string(),
      fileType: z.string(),
      pageCount: z.number().optional(),
      confidence: z.number().optional(),
      extractedAt: z.date(),
    })
    .optional(),
});

type FormSchema = z.infer<typeof formSchema>;

interface ExtractionResult {
  text: string;
  fileName: string;
  fileType: string;
  pageCount?: number;
  confidence?: number;
  extractedAt: string;
}

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL+"/extract" || 'http://localhost:3000/api';

const extractDocumentText = async (
  file: File,
  language: string = 'eng'
): Promise<ExtractionResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  formData.append('sanitize', 'true');



  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extract text');
  }

  const result = await response.json();
  return result.data;
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
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
      `}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileInput}
        accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf,.doc,.docx,.txt"
        disabled={disabled}
      />
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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

export const AnyFormatToTextTalksToBackend = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      extractedText: '',
      metadata: undefined,
    },
  });

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);
      setCurrentFile(file);

      try {
        const result = await extractDocumentText(file);

        form.setValue('extractedText', result.text);
        form.setValue('metadata', {
          fileName: result.fileName,
          fileType: result.fileType,
          pageCount: result.pageCount,
          confidence: result.confidence,
          extractedAt: new Date(result.extractedAt),
        });
        form.trigger('extractedText');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [form]
  );

  const handleClearFile = useCallback(() => {
    setCurrentFile(null);
    setError(null);
    form.reset();
  }, [form]);

  const onSubmit = useCallback(() => {
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Document Text Extractor</h1>
        <p className="text-slate-600">
          Upload an image, PDF, or Word document to extract and edit its text content.
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

          {form.getValues('metadata') && (
            <div className="text-xs text-slate-500 space-y-1 p-3 bg-slate-50 rounded">
              <p>
                <strong>File:</strong> {form.getValues('metadata')?.fileName}
              </p>
              <p>
                <strong>Type:</strong> {form.getValues('metadata')?.fileType}
              </p>
              {form.getValues('metadata')?.pageCount && (
                <p>
                  <strong>Pages:</strong> {form.getValues('metadata')?.pageCount}
                </p>
              )}
              {form.getValues('metadata')?.confidence && (
                <p>
                  <strong>OCR Confidence:</strong>{' '}
                  {form.getValues('metadata')?.confidence?.toFixed(2)}%
                </p>
              )}
              <p>
                <strong>Extracted:</strong>{' '}
                {form.getValues('metadata')?.extractedAt.toLocaleString()}
              </p>
            </div>
          )}

          <Button type="submit" disabled={isProcessing || !form.formState.isValid} className="w-full">
            Submit Extracted Text
          </Button>
        </form>
      </Form>
    </div>
  );
}