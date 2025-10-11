"use client";
import React, { useState, useRef, useEffect } from "react";
import { HelpCircle, CheckCircle } from "lucide-react";

interface AnalysisState {
  isLoading: boolean;
  content: string;
  error: string | null;
}

const JobAnalyzer: React.FC<{ documentId: string }> = ({ documentId }) => {
  //   const {user, useCareerDoc} = useAuth();
  //   const { data } = useCareerDoc<Resume>(documentId);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    content: "",
    error: null,
  });
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [analysis.content]);

  const handleAnalyze = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!jobDescription.trim()) {
      setAnalysis({
        isLoading: false,
        content: "",
        error: "Please enter a job description",
      });
      return;
    }

    setAnalysis({
      isLoading: true,
      content: "",
      error: null,
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API_URL}/v1/generate-interview-question`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobDescription }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.error) {
                setAnalysis((prev) => ({
                  ...prev,
                  error: parsed.error,
                  isLoading: false,
                }));
                return;
              }

              if (parsed.content) {
                fullContent += parsed.content;
                setAnalysis((prev) => ({
                  ...prev,
                  content: fullContent,
                }));
              }
            } catch (e) {
              console.error("Error parsing stream data:", e);
            }
          }
        }
      }

      setAnalysis((prev) => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      setAnalysis({
        isLoading: false,
        content: "",
        error: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleClear = (): void => {
    setJobDescription("");
    setAnalysis({
      isLoading: false,
      content: "",
      error: null,
    });
  };

  const qaData = [
    {
      question: "Tell me about yourself.",
      answer:
        "I'm a passionate software developer with 5 years of experience building scalable web applications. I specialize in React and Node.js, and I'm particularly excited about creating user-friendly interfaces that solve real problems. In my current role, I lead a team of three developers and have successfully delivered multiple projects on time.",
    },
   
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Interview Questions & Answers
          </h1>
          <p className="text-slate-600 text-lg">
            Prepare for your next interview with these common questions
          </p>
        </div>

        <div className="space-y-6">
          {qaData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-8">
                {/* Question Section */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <HelpCircle className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                      Question
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 leading-relaxed">
                      {item.question}
                    </h3>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 my-6"></div>

                {/* Answer Section */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wide">
                      Answer
                    </div>
                    <p className="text-slate-700 leading-relaxed text-lg">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobAnalyzer;


// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import { HelpCircle, CheckCircle, Loader2, AlertCircle } from "lucide-react";

// interface QAPair {
//   question: string;
//   answer: string;
//   isComplete: boolean;
// }

// interface AnalysisState {
//   isLoading: boolean;
//   qaPairs: QAPair[];
//   error: string | null;
// }

// const JobAnalyzer: React.FC<{ documentId: string }> = ({ documentId }) => {
//   const [jobDescription, setJobDescription] = useState<string>("");
//   const [analysis, setAnalysis] = useState<AnalysisState>({
//     isLoading: false,
//     qaPairs: [],
//     error: null,
//   });
//   const [rawContent, setRawContent] = useState<string>("");
//   const [showDebug, setShowDebug] = useState<boolean>(false);
//   const contentRef = useRef<HTMLDivElement>(null);
//   const abortControllerRef = useRef<AbortController | null>(null);

//   useEffect(() => {
//     if (contentRef.current) {
//       contentRef.current.scrollTop = contentRef.current.scrollHeight;
//     }
//   }, [analysis.qaPairs]);

//   useEffect(() => {
//     return () => {
//       abortControllerRef.current?.abort();
//     };
//   }, []);

//   /**
//    * Parses streaming content to extract Q&A pairs
//    * Handles multiple formats with enhanced robustness
//    */
//   const parseStreamingContent = (content: string): QAPair[] => {
//     console.log("=== PARSING CONTENT ===");
//     console.log("Raw content length:", content.length);
//     console.log("First 200 chars:", content.substring(0, 200));
    
//     const pairs: QAPair[] = [];
    
//     // Try different parsing strategies
    
//     // Strategy 1: Split by double newlines (common in AI responses)
//     const sections = content.split(/\n\s*\n/).filter(s => s.trim());
//     console.log("Found sections:", sections.length);
    
//     if (sections.length > 0) {
//       for (const section of sections) {
//         const lines = section.split('\n').map(l => l.trim()).filter(l => l);
        
//         let question = "";
//         let answer = "";
//         let foundAnswer = false;
        
//         for (let i = 0; i < lines.length; i++) {
//           const line = lines[i];
          
//           // Check for question markers
//           if (line.match(/^(?:Q(?:uestion)?[\s:]+|\d+[\.)]\s*)/i)) {
//             question = line.replace(/^(?:Q(?:uestion)?[\s:]+|\d+[\.)]\s*)/i, '').trim();
//           }
//           // Check for answer markers
//           else if (line.match(/^A(?:nswer)?[\s:]+/i)) {
//             answer = line.replace(/^A(?:nswer)?[\s:]+/i, '').trim();
//             foundAnswer = true;
//           }
//           // If we haven't found a question yet, this might be it
//           else if (!question && !foundAnswer) {
//             question = line;
//           }
//           // If we have a question and found answer marker, append to answer
//           else if (question && foundAnswer) {
//             answer += ' ' + line;
//           }
//         }
        
//         if (question) {
//           pairs.push({
//             question,
//             answer,
//             isComplete: !!(question && answer),
//           });
//         }
//       }
//     }
    
//     // Strategy 2: Fallback - simple line-by-line parsing
//     if (pairs.length === 0) {
//       console.log("Using fallback parser");
//       const lines = content.split('\n').filter(line => line.trim());
      
//       let currentQuestion = "";
//       let currentAnswer = "";
//       let isReadingAnswer = false;
      
//       for (const line of lines) {
//         const trimmedLine = line.trim();
        
//         if (trimmedLine.match(/^(?:Q(?:uestion)?[\s:]+|\d+[\.)]\s*)/i)) {
//           if (currentQuestion) {
//             pairs.push({
//               question: currentQuestion,
//               answer: currentAnswer,
//               isComplete: !!(currentQuestion && currentAnswer),
//             });
//           }
//           currentQuestion = trimmedLine.replace(/^(?:Q(?:uestion)?[\s:]+|\d+[\.)]\s*)/i, '').trim();
//           currentAnswer = "";
//           isReadingAnswer = false;
//         }
//         else if (trimmedLine.match(/^A(?:nswer)?[\s:]+/i)) {
//           currentAnswer = trimmedLine.replace(/^A(?:nswer)?[\s:]+/i, '').trim();
//           isReadingAnswer = true;
//         }
//         else if (isReadingAnswer) {
//           currentAnswer += (currentAnswer ? ' ' : '') + trimmedLine;
//         }
//         else if (currentQuestion && !isReadingAnswer) {
//           currentQuestion += ' ' + trimmedLine;
//         }
//       }
      
//       if (currentQuestion) {
//         pairs.push({
//           question: currentQuestion,
//           answer: currentAnswer,
//           isComplete: !!(currentQuestion && currentAnswer),
//         });
//       }
//     }
    
//     console.log("Parsed pairs:", pairs.length);
//     pairs.forEach((pair, idx) => {
//       console.log(`Pair ${idx + 1}:`, {
//         question: pair.question.substring(0, 50) + '...',
//         answer: pair.answer.substring(0, 50) + '...',
//         isComplete: pair.isComplete
//       });
//     });
    
//     return pairs;
//   };

//   const handleAnalyze = async (
//     e: React.FormEvent<HTMLFormElement>
//   ): Promise<void> => {
//     e.preventDefault();

//     if (!jobDescription.trim()) {
//       setAnalysis({
//         isLoading: false,
//         qaPairs: [],
//         error: "Please enter a job description",
//       });
//       return;
//     }

//     // Cancel any existing request
//     abortControllerRef.current?.abort();
//     abortControllerRef.current = new AbortController();

//     setAnalysis({
//       isLoading: true,
//       qaPairs: [],
//       error: null,
//     });
//     setRawContent("");

//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_AUTH_API_URL}/v1/generate-interview-question`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ jobDescription }),
//           signal: abortControllerRef.current.signal,
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const reader = response.body?.getReader();
//       const decoder = new TextDecoder();

//       if (!reader) {
//         throw new Error("Response body is not readable");
//       }

//       let accumulatedContent = "";

//       while (true) {
//         const { done, value } = await reader.read();

//         if (done) break;

//         const chunk = decoder.decode(value, { stream: true });
//         const lines = chunk.split("\n");

//         for (const line of lines) {
//           if (line.startsWith("data: ")) {
//             const data = line.slice(6).trim();

//             if (data === "[DONE]") {
//               continue;
//             }

//             try {
//               const parsed = JSON.parse(data);

//               if (parsed.error) {
//                 setAnalysis((prev) => ({
//                   ...prev,
//                   error: parsed.error,
//                   isLoading: false,
//                 }));
//                 return;
//               }

//               if (parsed.content) {
//                 accumulatedContent += parsed.content;
                
//                 // Parse and update Q&A pairs as content streams in
//                 const qaPairs = parseStreamingContent(accumulatedContent);
                
//                 setAnalysis((prev) => ({
//                   ...prev,
//                   qaPairs,
//                 }));
//               }
//             } catch (parseError) {
//               console.error("Error parsing stream data:", parseError, "Raw data:", data);
//             }
//           }
//         }
//       }

//       setAnalysis((prev) => ({
//         ...prev,
//         isLoading: false,
//       }));
//     } catch (error) {
//       if (error instanceof Error && error.name === 'AbortError') {
//         console.log("Request was cancelled");
//         return;
//       }
      
//       setAnalysis({
//         isLoading: false,
//         qaPairs: [],
//         error: error instanceof Error ? error.message : "An error occurred",
//       });
//     }
//   };

//   const handleClear = (): void => {
//     abortControllerRef.current?.abort();
//     setJobDescription("");
//     setRawContent("");
//     setAnalysis({
//       isLoading: false,
//       qaPairs: [],
//       error: null,
//     });
//   };

//   const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>): void => {
//     e.preventDefault();
//     const fakeEvent = {
//       preventDefault: () => {},
//     } as React.FormEvent<HTMLFormElement>;
//     handleAnalyze(fakeEvent);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
//       <div className="max-w-5xl mx-auto">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-slate-800 mb-3">
//             Interview Questions & Answers
//           </h1>
//           <p className="text-slate-600 text-lg">
//             Generate personalized interview questions based on job descriptions
//           </p>
//         </div>

//         {/* Input Section */}
//         <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-200">
//           <div className="space-y-6">
//             <div>
//               <label htmlFor="jobDescription" className="block text-sm font-semibold text-slate-700 mb-2">
//                 Job Description
//               </label>
//               <textarea
//                 id="jobDescription"
//                 value={jobDescription}
//                 onChange={(e) => setJobDescription(e.target.value)}
//                 placeholder="Paste the job description here..."
//                 className="w-full h-40 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-700"
//                 disabled={analysis.isLoading}
//               />
//             </div>
            
//             <div className="flex gap-4">
//               <button
//                 onClick={handleSubmit}
//                 disabled={analysis.isLoading || !jobDescription.trim()}
//                 className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
//               >
//                 {analysis.isLoading ? (
//                   <>
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     Generating...
//                   </>
//                 ) : (
//                   'Generate Questions'
//                 )}
//               </button>
              
//               {(analysis.qaPairs.length > 0 || analysis.isLoading) && (
//                 <button
//                   onClick={handleClear}
//                   className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors duration-200"
//                 >
//                   Clear
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Error Display */}
//         {analysis.error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//             <div>
//               <h3 className="text-sm font-semibold text-red-800 mb-1">Error</h3>
//               <p className="text-sm text-red-700">{analysis.error}</p>
//             </div>
//           </div>
//         )}

//         {/* Debug Panel */}
//         {(rawContent || analysis.qaPairs.length > 0) && (
//           <div className="bg-white rounded-lg shadow p-4 mb-8 border border-slate-200">
//             <button
//               onClick={() => setShowDebug(!showDebug)}
//               className="text-sm font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-2"
//             >
//               {showDebug ? '▼' : '▶'} Debug Info
//             </button>
//             {showDebug && (
//               <div className="mt-4 space-y-4">
//                 <div>
//                   <div className="text-xs font-semibold text-slate-600 mb-2">Raw Content ({rawContent.length} chars)</div>
//                   <pre className="bg-slate-50 p-3 rounded text-xs overflow-auto max-h-40 text-slate-700 whitespace-pre-wrap">
//                     {rawContent || 'No content yet...'}
//                   </pre>
//                 </div>
//                 <div>
//                   <div className="text-xs font-semibold text-slate-600 mb-2">Parsed Pairs ({analysis.qaPairs.length})</div>
//                   <pre className="bg-slate-50 p-3 rounded text-xs overflow-auto max-h-40 text-slate-700">
//                     {JSON.stringify(analysis.qaPairs, null, 2)}
//                   </pre>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Q&A Pairs Display */}
//         <div ref={contentRef} className="space-y-6">
//           {analysis.qaPairs.map((item, index) => (
//             <div
//               key={index}
//               className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow duration-300"
//             >
//               <div className="p-8">
//                 {/* Question Section */}
//                 <div className="flex gap-4 mb-6">
//                   <div className="flex-shrink-0">
//                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                       <HelpCircle className="w-6 h-6 text-blue-600" />
//                     </div>
//                   </div>
//                   <div className="flex-1">
//                     <div className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">
//                       Question {index + 1}
//                     </div>
//                     <h3 className="text-xl font-semibold text-slate-800 leading-relaxed">
//                       {item.question || (
//                         <span className="text-slate-400 italic">Loading question...</span>
//                       )}
//                     </h3>
//                   </div>
//                 </div>

//                 {/* Divider */}
//                 <div className="border-t border-slate-200 my-6"></div>

//                 {/* Answer Section */}
//                 <div className="flex gap-4">
//                   <div className="flex-shrink-0">
//                     <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
//                       item.answer ? 'bg-emerald-100' : 'bg-slate-100'
//                     }`}>
//                       {item.answer ? (
//                         <CheckCircle className="w-6 h-6 text-emerald-600" />
//                       ) : (
//                         <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex-1">
//                     <div className={`text-sm font-semibold mb-2 uppercase tracking-wide ${
//                       item.answer ? 'text-emerald-600' : 'text-slate-400'
//                     }`}>
//                       Answer
//                     </div>
//                     <p className="text-slate-700 leading-relaxed text-lg">
//                       {item.answer || (
//                         <span className="text-slate-400 italic">Waiting for answer...</span>
//                       )}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
          
//           {analysis.isLoading && analysis.qaPairs.length === 0 && (
//             <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200 text-center">
//               <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
//               <p className="text-slate-600">Analyzing job description and generating questions...</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JobAnalyzer;