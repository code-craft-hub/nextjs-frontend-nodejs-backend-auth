// import React from 'react';

// interface StreamingControlsProps {
//   prompt: string;
//   systemMessage: string;
//   aiModel: string;
//   isStreaming: boolean;
//   onPromptChange: (value: string) => void;
//   onSystemMessageChange: (value: string) => void;
//   onAiModelChange: (value: string) => void;
//   onGenerate: () => void;
//   onStop: () => void;
//   onClear: () => void;
// }


// export const StreamingControls: React.FC<StreamingControlsProps> = ({
//   prompt,
//   systemMessage,
//   aiModel,
//   isStreaming,
//   onPromptChange,
//   onSystemMessageChange,
//   onAiModelChange,
//   onGenerate,
//   onStop,
//   onClear
// }) => {
    
//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
//       e.preventDefault();
//       onGenerate();
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
     


//       {/* Action Buttons */}
//       <div className="flex gap-3">
//         {!isStreaming ? (
//           <>
//             <button
//               onClick={onGenerate}
//               disabled={!prompt.trim()}
//               className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M13 10V3L4 14h7v7l9-11h-7z"
//                 />
//               </svg>
//               Generate Content
//             </button>
//             <button
//               onClick={onClear}
//               className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
//             >
//               Clear
//             </button>
//           </>
//         ) : (
//           <button
//             onClick={onStop}
//             className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="currentColor"
//               viewBox="0 0 20 20"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             Stop Streaming
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };