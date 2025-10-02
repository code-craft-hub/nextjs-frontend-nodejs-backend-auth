import { useRef, useCallback, useEffect } from 'react';

interface UseAutoResizeTextareaProps {
  minHeight?: number;
  maxHeight?: number;
}

export function useAutoResizeTextarea({
  minHeight = 60,
  maxHeight = 200,
}: UseAutoResizeTextareaProps = {}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback((reset = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (reset) {
      // Reset height to minimum when clearing content
      textarea.style.height = `${minHeight}px`;
      return;
    }

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate the new height
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    
    // Set the new height
    textarea.style.height = `${newHeight}px`;
    
    // Handle overflow for max height
    if (scrollHeight > maxHeight) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  }, [minHeight, maxHeight]);

  // Adjust height when component mounts
  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  return {
    textareaRef,
    adjustHeight,
  };
}


// THIS IS THE MAIN HOOK EXTRACTED FROM THE UI LIBRARY

// import { useEffect, useRef, useCallback } from "react";

// interface UseAutoResizeTextareaProps {
//   minHeight: number;
//   maxHeight?: number;
// }

// export function useAutoResizeTextarea({
//   minHeight,
//   maxHeight,
// }: UseAutoResizeTextareaProps) {
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   const adjustHeight = useCallback(
//     (reset?: boolean) => {
//       const textarea = textareaRef.current;
//       if (!textarea) return;

//       if (reset) {
//         textarea.style.height = `${minHeight}px`;
//         return;
//       }

//       textarea.style.height = `${minHeight}px`;
//       const newHeight = Math.max(
//         minHeight,
//         Math.min(
//           textarea.scrollHeight,
//           maxHeight ?? Number.POSITIVE_INFINITY
//         )
//       );
//       textarea.style.height = `${newHeight}px`;
//     },
//     [minHeight, maxHeight]
//   );

//   useEffect(() => {
//     const textarea = textareaRef.current;
//     if (textarea) textarea.style.height = `${minHeight}px`;
//   }, [minHeight]);

//   useEffect(() => {
//     const handleResize = () => adjustHeight();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [adjustHeight]);

//   return { textareaRef, adjustHeight };
// }
