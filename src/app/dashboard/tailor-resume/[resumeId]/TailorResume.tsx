"use client";

/**
 * Demo React/TypeScript frontend for consuming the resume SSE stream.
 * NO styling — only the live streaming functionality.
 *
 * SSE event flow from the backend (POST /api/v1/resume/generate):
 *   1. { step:"generating", progress, message }
 *   2. { step:"streaming", progress, message, data:{ chunk } } × N
 *   3. { title }                          — generated title
 *   4. { step:"parsing",  progress, message }
 *   5. { step:"saving",   progress, message }
 *   6. { step:"complete", progress, message, data: savedResume }
 *   7. { step:"error",    progress, message }
 */
import { BACKEND_API_VERSION } from "@/lib/api/profile.api";
import { api, BASEURL } from "@/lib/api/client";
import  { useState, useRef } from "react";

const API_URL = `${BASEURL}/${BACKEND_API_VERSION}/resumes/generate`;
/* ── Types ─────────────────────────────────────────────────── */

/**
 * Demo React/TypeScript frontend for consuming the resume SSE stream.
 * NO styling — only the live streaming functionality.
 *
 * SSE event flow from the backend (POST /api/v1/resume/generate):
 *   1. { step:"generating", progress, message }
 *   2. { step:"streaming", progress, message, data:{ chunk } } × N
 *   3. { title }                          — generated title
 *   4. { step:"parsing",  progress, message }
 *   5. { step:"saving",   progress, message }
 *   6. { step:"complete", progress, message, data: savedResume }
 *   7. { step:"error",    progress, message }
 */


/* ── Types ─────────────────────────────────────────────────── */

interface ResumeSections {
  profile?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  location?: string;
  jobTitle?: string;
  linkedIn?: string;
  github?: string;
  website?: string;
  education?: any[];
  workExperience?: any[];
  certification?: any[];
  project?: any[];
  softSkill?: { label: string; value: string }[];
  hardSkill?: { label: string; value: string }[];
}

interface StreamState {
  title: string;
  sections: ResumeSections;
  savedResume: any;
  error: string;
  isStreaming: boolean;
  step: string;
  progress: number;
  message: string;
}

/* ── Incremental section extractor ─────────────────────────── */

/**
 * Scans the partial JSON string and independently extracts each
 * top-level key-value pair. For completed string/number/bool/null
 * values the value is returned as-is. For completed arrays/objects
 * the parsed value is returned. For INCOMPLETE arrays, every
 * individually-complete object item inside them is extracted so
 * that e.g. the first work-experience entry shows up while the
 * second is still streaming. For incomplete string values (like
 * a profile summary still being typed) the partial text is returned
 * so the user sees it character-by-character.
 */
function extractCompleteSections(raw: string): ResumeSections {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
  }
  s = s.trim();

  // Fast path — if the full JSON is valid, just parse it
  try {
    return JSON.parse(s);
  } catch {
    /* fall through to incremental extraction */
  }

  const sections: Record<string, any> = {};
  let i = s.indexOf("{");
  if (i === -1) return sections;
  i++; // skip the opening brace of the top-level object

  while (i < s.length) {
    // ── Find the next key ──────────────────────────────────
    const keyOpen = s.indexOf('"', i);
    if (keyOpen === -1) break;

    let keyClose = -1;
    let esc = false;
    for (let j = keyOpen + 1; j < s.length; j++) {
      if (esc) { esc = false; continue; }
      if (s[j] === "\\") { esc = true; continue; }
      if (s[j] === '"') { keyClose = j; break; }
    }
    if (keyClose === -1) break; // key name still streaming

    const key = s.substring(keyOpen + 1, keyClose);

    // ── Find the colon after the key ───────────────────────
    let colon = -1;
    for (let j = keyClose + 1; j < s.length; j++) {
      if (s[j] === ":") { colon = j; break; }
      if (!/\s/.test(s[j])) break; // non-whitespace that isn't ':'
    }
    if (colon === -1) { i = keyClose + 1; continue; }

    // ── Find where the value starts ────────────────────────
    let vStart = -1;
    for (let j = colon + 1; j < s.length; j++) {
      if (!/\s/.test(s[j])) { vStart = j; break; }
    }
    if (vStart === -1) { i = colon + 1; continue; }

    const ch = s[vStart];

    // ── STRING value ───────────────────────────────────────
    if (ch === '"') {
      let strEnd = -1;
      esc = false;
      for (let j = vStart + 1; j < s.length; j++) {
        if (esc) { esc = false; continue; }
        if (s[j] === "\\") { esc = true; continue; }
        if (s[j] === '"') { strEnd = j; break; }
      }
      if (strEnd !== -1) {
        // Complete string value
        try { sections[key] = JSON.parse(s.substring(vStart, strEnd + 1)); } catch {}
        i = strEnd + 1;
      } else {
        // Incomplete string — show what we have so far (live typing)
        const partial = s.substring(vStart + 1);
        sections[key] = partial
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");
        break; // we're at the streaming edge
      }
      continue;
    }

    // ── ARRAY value ────────────────────────────────────────
    if (ch === "[") {
      let depth = 0;
      let inStr = false;
      esc = false;
      let arrEnd = -1;

      for (let j = vStart; j < s.length; j++) {
        const c = s[j];
        if (esc) { esc = false; continue; }
        if (c === "\\" && inStr) { esc = true; continue; }
        if (c === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (c === "[") depth++;
        else if (c === "]") { depth--; if (depth === 0) { arrEnd = j; break; } }
      }

      if (arrEnd !== -1) {
        // Complete array
        try { sections[key] = JSON.parse(s.substring(vStart, arrEnd + 1)); } catch {}
        i = arrEnd + 1;
      } else {
        // Incomplete array — pull out every individually-complete object item
        const items: any[] = [];
        let objStart = -1;
        let objDepth = 0;
        inStr = false;
        esc = false;

        for (let j = vStart + 1; j < s.length; j++) {
          const c = s[j];
          if (esc) { esc = false; continue; }
          if (c === "\\" && inStr) { esc = true; continue; }
          if (c === '"') { inStr = !inStr; continue; }
          if (inStr) continue;

          if (c === "{") {
            if (objDepth === 0) objStart = j;
            objDepth++;
          } else if (c === "}") {
            objDepth--;
            if (objDepth === 0 && objStart !== -1) {
              try { items.push(JSON.parse(s.substring(objStart, j + 1))); } catch {}
              objStart = -1;
            }
          }
        }

        if (items.length > 0) sections[key] = items;
        break; // currently streaming inside this array
      }
      continue;
    }

    // ── OBJECT value ───────────────────────────────────────
    if (ch === "{") {
      let depth = 0;
      let inStr = false;
      esc = false;
      let objEnd = -1;

      for (let j = vStart; j < s.length; j++) {
        const c = s[j];
        if (esc) { esc = false; continue; }
        if (c === "\\" && inStr) { esc = true; continue; }
        if (c === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (c === "{") depth++;
        else if (c === "}") { depth--; if (depth === 0) { objEnd = j; break; } }
      }

      if (objEnd !== -1) {
        try { sections[key] = JSON.parse(s.substring(vStart, objEnd + 1)); } catch {}
        i = objEnd + 1;
      } else {
        break; // object still streaming
      }
      continue;
    }

    // ── Primitive value (number, boolean, null) ────────────
    const primMatch = s.substring(vStart).match(
      /^(true|false|null|-?\d+\.?\d*(?:[eE][+-]?\d+)?)/,
    );
    if (primMatch) {
      try { sections[key] = JSON.parse(primMatch[1]); } catch {}
      i = vStart + primMatch[1].length;
    } else {
      i = vStart + 1;
    }
  }

  return sections;
}

/* ── Component ─────────────────────────────────────────────── */

export default function ResumeStreamDemo() {
  const [state, setState] = useState<StreamState>({
    title: "",
    sections: {},
    savedResume: null,
    error: "",
    isStreaming: false,
    step: "",
    progress: 0,
    message: "",
  });

  const [jobDescription, setJobDescription] = useState("");
  const [userProfile, setUserProfile] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const rawRef = useRef("");

  /* ── Start streaming ── */

  const startGeneration = async () => {
    setState({
      title: "",
      sections: {},
      savedResume: null,
      error: "",
      isStreaming: true,
      step: "",
      progress: 0,
      message: "",
    });
    rawRef.current = "";
    abortRef.current = new AbortController();

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescription, userProfile }),
        signal: abortRef.current.signal,
        credentials: "include",
      });

      if (!response.ok || !response.body) {
        setState((prev) => ({
          ...prev,
          error: `HTTP ${response.status}`,
          isStreaming: false,
        }));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by "\n\n"
        const messages = buffer.split("\n\n");
        buffer = messages.pop() || "";

        for (const msg of messages) {
          const trimmed = msg.trim();
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const parsed = JSON.parse(trimmed.slice(6));

            // Title event (arrives after content stream)
            if (parsed.title) {
              setState((prev) => ({ ...prev, title: parsed.title }));
            }

            // Streaming chunk — accumulate raw JSON & extract sections
            if (parsed.step === "streaming" && parsed.data?.chunk) {
              rawRef.current += parsed.data.chunk;
              const sections = extractCompleteSections(rawRef.current);
              setState((prev) => ({
                ...prev,
                step: parsed.step,
                progress: parsed.progress,
                message: parsed.message,
                sections: { ...prev.sections, ...sections },
              }));
            }

            // Non-streaming lifecycle steps
            if (parsed.step && parsed.step !== "streaming") {
              setState((prev) => ({
                ...prev,
                step: parsed.step,
                progress: parsed.progress ?? prev.progress,
                message: parsed.message ?? prev.message,
              }));
            }

            // Complete — backend saved the resume
            if (parsed.step === "complete" && parsed.data) {
              setState((prev) => ({
                ...prev,
                savedResume: parsed.data,
                isStreaming: false,
                step: "complete",
                progress: 100,
                message: parsed.message,
              }));
            }

            // Error
            if (parsed.step === "error") {
              setState((prev) => ({
                ...prev,
                error: parsed.message,
                isStreaming: false,
              }));
            }
          } catch {
            // ignore malformed SSE frames
          }
        }
      }

      // Stream ended
      setState((prev) => ({ ...prev, isStreaming: false }));
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        error: String(err),
        isStreaming: false,
      }));
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, isStreaming: false }));
  };

  /* ── Render sections live ── */

  const { sections } = state;

  return (
    <div>
      <h2>Resume Stream Demo</h2>

      <textarea
        rows={4}
        cols={60}
        placeholder="Paste job description here"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      <br />
      <textarea
        rows={4}
        cols={60}
        placeholder="Paste user profile / resume text here"
        value={userProfile}
        onChange={(e) => setUserProfile(e.target.value)}
      />
      <br />

      <button
        onClick={startGeneration}
        disabled={state.isStreaming || !jobDescription}
      >
        Generate Resume
      </button>
      <button onClick={stopGeneration} disabled={!state.isStreaming}>
        Stop
      </button>

      {state.message && (
        <p>
          {state.message} ({state.progress}%)
        </p>
      )}
      {state.error && <p>Error: {state.error}</p>}
      {state.title && <h3>{state.title}</h3>}

      {/* ── Personal info ── */}
      {sections.fullName && (
        <section>
          <h4>{sections.fullName}</h4>
          <p>
            {[sections.email, sections.phoneNumber, sections.location]
              .filter(Boolean)
              .join(" | ")}
          </p>
          <p>
            {[sections.linkedIn, sections.github, sections.website]
              .filter(Boolean)
              .join(" | ")}
          </p>
        </section>
      )}

      {/* ── Profile / Summary ── */}
      {sections.profile && (
        <section>
          <h4>Profile</h4>
          <p>{sections.profile}</p>
        </section>
      )}

      {/* ── Education ── */}
      {sections.education && sections.education.length > 0 && (
        <section>
          <h4>Education</h4>
          {sections.education.map((edu: any, i: number) => (
            <div key={edu.educationId || i}>
              <strong>
                {edu.degree}
                {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
              </strong>{" "}
              — {edu.schoolName}
              <br />
              {edu.educationStart} – {edu.educationEnd}
              {edu.schoolLocation ? ` | ${edu.schoolLocation}` : ""}
            </div>
          ))}
        </section>
      )}

      {/* ── Work Experience ── */}
      {sections.workExperience && sections.workExperience.length > 0 && (
        <section>
          <h4>Work Experience</h4>
          {sections.workExperience.map((w: any, i: number) => (
            <div key={w.workExperienceId || i}>
              <strong>{w.jobTitle}</strong> at {w.companyName}
              <br />
              {w.jobStart} – {w.jobEnd}
              {w.location ? ` | ${w.location}` : ""}
              {w.workDescription && <p>{w.workDescription}</p>}
              {w.responsibilities?.length > 0 && (
                <ul>
                  {w.responsibilities.map((r: string, j: number) => (
                    <li key={j}>{r}</li>
                  ))}
                </ul>
              )}
              {w.achievements?.length > 0 && (
                <ul>
                  {w.achievements.map((a: string, j: number) => (
                    <li key={j}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Certifications ── */}
      {sections.certification && sections.certification.length > 0 && (
        <section>
          <h4>Certifications</h4>
          {sections.certification.map((c: any, i: number) => (
            <div key={c.certificationId || i}>
              <strong>{c.title}</strong> — {c.issuer}
              <br />
              {c.issueDate}
              {c.expiryDate ? ` – ${c.expiryDate}` : ""}
              {c.description && <p>{c.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* ── Projects ── */}
      {sections.project && sections.project.length > 0 && (
        <section>
          <h4>Projects</h4>
          {sections.project.map((p: any, i: number) => (
            <div key={p.projectId || i}>
              <strong>{p.name}</strong>
              {p.role ? ` (${p.role})` : ""}
              {p.description && <p>{p.description}</p>}
              {p.techStack?.length > 0 && (
                <p>Tech: {p.techStack.join(", ")}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Hard Skills ── */}
      {sections.hardSkill && sections.hardSkill.length > 0 && (
        <section>
          <h4>Hard Skills</h4>
          <p>{sections.hardSkill.map((sk: any) => sk.label).join(", ")}</p>
        </section>
      )}

      {/* ── Soft Skills ── */}
      {sections.softSkill && sections.softSkill.length > 0 && (
        <section>
          <h4>Soft Skills</h4>
          <p>{sections.softSkill.map((sk: any) => sk.label).join(", ")}</p>
        </section>
      )}

      {state.savedResume && <p>Saved — Resume ID: {state.savedResume.id}</p>}
      {state.isStreaming && <p>Streaming...</p>}
    </div>
  );
}


// interface ResumeSections {
//   profile?: string;
//   fullName?: string;
//   email?: string;
//   phoneNumber?: string;
//   location?: string;
//   jobTitle?: string;
//   linkedIn?: string;
//   github?: string;
//   website?: string;
//   education?: any[];
//   workExperience?: any[];
//   certification?: any[];
//   project?: any[];
//   softSkill?: { label: string; value: string }[];
//   hardSkill?: { label: string; value: string }[];
// }

// interface StreamState {
//   title: string;
//   sections: ResumeSections;
//   savedResume: any;
//   error: string;
//   isStreaming: boolean;
//   step: string;
//   progress: number;
//   message: string;
// }

// /* ── Partial JSON repair ───────────────────────────────────── */

// /**
//  * Tries to parse an incomplete JSON string by closing any open
//  * structures (strings, arrays, objects). Returns null when the
//  * accumulated content isn't parseable yet even after repair.
//  */
// function tryParsePartialJSON(raw: string): Record<string, any> | null {
//   let s = raw.trim();
//   if (s.startsWith("```")) {
//     s = s.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
//   }
//   s = s.trim();
//   if (!s.startsWith("{")) return null;

//   // Already valid?
//   try {
//     return JSON.parse(s);
//   } catch {
//     /* continue to repair */
//   }

//   // Walk through and track open structures
//   let inString = false;
//   let escape = false;
//   const stack: string[] = [];

//   for (let i = 0; i < s.length; i++) {
//     const ch = s[i];
//     if (escape) {
//       escape = false;
//       continue;
//     }
//     if (ch === "\\" && inString) {
//       escape = true;
//       continue;
//     }
//     if (ch === '"') {
//       inString = !inString;
//       continue;
//     }
//     if (inString) continue;

//     if (ch === "{") stack.push("}");
//     else if (ch === "[") stack.push("]");
//     else if (ch === "}" || ch === "]") {
//       if (stack.length > 0 && stack[stack.length - 1] === ch) stack.pop();
//     }
//   }

//   let repaired = s;
//   // Close an unterminated string
//   if (inString) repaired += '"';
//   // Strip trailing comma (invalid before a closing bracket/brace)
//   repaired = repaired.replace(/,\s*$/, "");
//   // Close all open structures in reverse order
//   for (let i = stack.length - 1; i >= 0; i--) {
//     repaired += stack[i];
//   }

//   try {
//     return JSON.parse(repaired);
//   } catch {
//     return null;
//   }
// }

// /* ── Component ─────────────────────────────────────────────── */

// export default function ResumeStreamDemo() {
//   const [state, setState] = useState<StreamState>({
//     title: "",
//     sections: {},
//     savedResume: null,
//     error: "",
//     isStreaming: false,
//     step: "",
//     progress: 0,
//     message: "",
//   });

//   const [jobDescription, setJobDescription] = useState("");
//   const [userProfile, setUserProfile] = useState("");
//   const abortRef = useRef<AbortController | null>(null);
//   const rawRef = useRef("");

//   /* ── Start streaming ── */

//   const startGeneration = async () => {
//     setState({
//       title: "",
//       sections: {},
//       savedResume: null,
//       error: "",
//       isStreaming: true,
//       step: "",
//       progress: 0,
//       message: "",
//     });
//     rawRef.current = "";
//     abortRef.current = new AbortController();

//     try {
//       const response = await fetch(API_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ jobDescription, userProfile }),
//         signal: abortRef.current.signal,
//         credentials: "include",
//       });

//       if (!response.ok || !response.body) {
//         setState((prev) => ({
//           ...prev,
//           error: `HTTP ${response.status}`,
//           isStreaming: false,
//         }));
//         return;
//       }

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();
//       let buffer = "";

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;

//         buffer += decoder.decode(value, { stream: true });

//         // SSE messages are separated by "\n\n"
//         const messages = buffer.split("\n\n");
//         buffer = messages.pop() || "";

//         for (const msg of messages) {
//           const trimmed = msg.trim();
//           if (!trimmed.startsWith("data: ")) continue;

//           try {
//             const parsed = JSON.parse(trimmed.slice(6));

//             // Title event (arrives after content stream)
//             if (parsed.title) {
//               setState((prev) => ({ ...prev, title: parsed.title }));
//             }

//             // Streaming chunk — accumulate raw JSON & try incremental parse
//             if (parsed.step === "streaming" && parsed.data?.chunk) {
//               rawRef.current += parsed.data.chunk;
//               const sections = tryParsePartialJSON(rawRef.current);
//               setState((prev) => ({
//                 ...prev,
//                 step: parsed.step,
//                 progress: parsed.progress,
//                 message: parsed.message,
//                 ...(sections ? { sections } : {}),
//               }));
//             }

//             // Non-streaming lifecycle steps
//             if (parsed.step && parsed.step !== "streaming") {
//               setState((prev) => ({
//                 ...prev,
//                 step: parsed.step,
//                 progress: parsed.progress ?? prev.progress,
//                 message: parsed.message ?? prev.message,
//               }));
//             }

//             // Complete — backend saved the resume
//             if (parsed.step === "complete" && parsed.data) {
//               setState((prev) => ({
//                 ...prev,
//                 savedResume: parsed.data,
//                 isStreaming: false,
//                 step: "complete",
//                 progress: 100,
//                 message: parsed.message,
//               }));
//             }

//             // Error
//             if (parsed.step === "error") {
//               setState((prev) => ({
//                 ...prev,
//                 error: parsed.message,
//                 isStreaming: false,
//               }));
//             }
//           } catch {
//             // ignore malformed SSE frames
//           }
//         }
//       }

//       // Stream ended
//       setState((prev) => ({ ...prev, isStreaming: false }));
//     } catch (err: unknown) {
//       if (err instanceof DOMException && err.name === "AbortError") return;
//       setState((prev) => ({
//         ...prev,
//         error: String(err),
//         isStreaming: false,
//       }));
//     }
//   };

//   const stopGeneration = () => {
//     abortRef.current?.abort();
//     setState((prev) => ({ ...prev, isStreaming: false }));
//   };

//   /* ── Render sections live ── */

//   const { sections } = state;

//   return (
//     <div>
//       <h2>Resume Stream Demo</h2>

//       <textarea
//         rows={4}
//         cols={60}
//         placeholder="Paste job description here"
//         value={jobDescription}
//         onChange={(e) => setJobDescription(e.target.value)}
//       />
//       <br />
//       <textarea
//         rows={4}
//         cols={60}
//         placeholder="Paste user profile / resume text here"
//         value={userProfile}
//         onChange={(e) => setUserProfile(e.target.value)}
//       />
//       <br />

//       <button
//         onClick={startGeneration}
//         disabled={state.isStreaming || !jobDescription}
//       >
//         Generate Resume
//       </button>
//       <button onClick={stopGeneration} disabled={!state.isStreaming}>
//         Stop
//       </button>

//       {state.message && (
//         <p>
//           {state.message} ({state.progress}%)
//         </p>
//       )}
//       {state.error && <p>Error: {state.error}</p>}
//       {state.title && <h3>{state.title}</h3>}

//       {/* ── Personal info ── */}
//       {sections.fullName && (
//         <section>
//           <h4>{sections.fullName}</h4>
//           <p>
//             {[sections.email, sections.phoneNumber, sections.location]
//               .filter(Boolean)
//               .join(" | ")}
//           </p>
//           <p>
//             {[sections.linkedIn, sections.github, sections.website]
//               .filter(Boolean)
//               .join(" | ")}
//           </p>
//         </section>
//       )}

//       {/* ── Profile / Summary ── */}
//       {sections.profile && (
//         <section>
//           <h4>Profile</h4>
//           <p>{sections.profile}</p>
//         </section>
//       )}

//       {/* ── Education ── */}
//       {sections.education && sections.education.length > 0 && (
//         <section>
//           <h4>Education</h4>
//           {sections.education.map((edu: any, i: number) => (
//             <div key={edu.educationId || i}>
//               <strong>
//                 {edu.degree}
//                 {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
//               </strong>{" "}
//               — {edu.schoolName}
//               <br />
//               {edu.educationStart} – {edu.educationEnd}
//               {edu.schoolLocation ? ` | ${edu.schoolLocation}` : ""}
//             </div>
//           ))}
//         </section>
//       )}

//       {/* ── Work Experience ── */}
//       {sections.workExperience && sections.workExperience.length > 0 && (
//         <section>
//           <h4>Work Experience</h4>
//           {sections.workExperience.map((w: any, i: number) => (
//             <div key={w.workExperienceId || i}>
//               <strong>{w.jobTitle}</strong> at {w.companyName}
//               <br />
//               {w.jobStart} – {w.jobEnd}
//               {w.location ? ` | ${w.location}` : ""}
//               {w.workDescription && <p>{w.workDescription}</p>}
//               {w.responsibilities?.length > 0 && (
//                 <ul>
//                   {w.responsibilities.map((r: string, j: number) => (
//                     <li key={j}>{r}</li>
//                   ))}
//                 </ul>
//               )}
//               {w.achievements?.length > 0 && (
//                 <ul>
//                   {w.achievements.map((a: string, j: number) => (
//                     <li key={j}>{a}</li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           ))}
//         </section>
//       )}

//       {/* ── Certifications ── */}
//       {sections.certification && sections.certification.length > 0 && (
//         <section>
//           <h4>Certifications</h4>
//           {sections.certification.map((c: any, i: number) => (
//             <div key={c.certificationId || i}>
//               <strong>{c.title}</strong> — {c.issuer}
//               <br />
//               {c.issueDate}
//               {c.expiryDate ? ` – ${c.expiryDate}` : ""}
//               {c.description && <p>{c.description}</p>}
//             </div>
//           ))}
//         </section>
//       )}

//       {/* ── Projects ── */}
//       {sections.project && sections.project.length > 0 && (
//         <section>
//           <h4>Projects</h4>
//           {sections.project.map((p: any, i: number) => (
//             <div key={p.projectId || i}>
//               <strong>{p.name}</strong>
//               {p.role ? ` (${p.role})` : ""}
//               {p.description && <p>{p.description}</p>}
//               {p.techStack?.length > 0 && (
//                 <p>Tech: {p.techStack.join(", ")}</p>
//               )}
//             </div>
//           ))}
//         </section>
//       )}

//       {/* ── Hard Skills ── */}
//       {sections.hardSkill && sections.hardSkill.length > 0 && (
//         <section>
//           <h4>Hard Skills</h4>
//           <p>{sections.hardSkill.map((s: any) => s.label).join(", ")}</p>
//         </section>
//       )}

//       {/* ── Soft Skills ── */}
//       {sections.softSkill && sections.softSkill.length > 0 && (
//         <section>
//           <h4>Soft Skills</h4>
//           <p>{sections.softSkill.map((s: any) => s.label).join(", ")}</p>
//         </section>
//       )}

//       {state.savedResume && <p>Saved — Resume ID: {state.savedResume.id}</p>}
//       {state.isStreaming && <p>Streaming...</p>}
//     </div>
//   );
// }














// "use client";
// import { useEffect, useRef } from "react";
// import { useResumeStream } from "@/hooks/stream-resume-hook";
// import { toast } from "sonner";
// import { COLLECTIONS } from "@/lib/utils/constants";
// import { EditableResume } from "../../(dashboard)/ai-apply/components/resume/EditableResume";
// import { ProgressIndicator } from "../../(dashboard)/ai-apply/progress-indicator";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { resumeQueries } from "@/lib/queries/resume.queries";
// import { userQueries } from "@/lib/queries/user.queries";
// import { ResumeDownloadButton } from "./ResumeDownloadButton";
// import { TrashIcon } from "lucide-react";
// import { sendGTMEvent } from "@next/third-parties/google";
// import { BACKEND_API_VERSION } from "@/lib/api/profile.api";
// import { api, BASEURL } from "@/lib/api/client";

// const API_URL = `${BASEURL}/${BACKEND_API_VERSION}/resumes/generate`;

// export const TailorResume = ({
//   jobDescription,
//   resumeId,
//   coverLetterId,
//   aiApply,
//   recruiterEmail,
// }: {
//   jobDescription: string;
//   resumeId: string;
//   coverLetterId: string;
//   aiApply: boolean;
//   recruiterEmail: string;
// }) => {
//   const { data: user } = useQuery(userQueries.detail());
//   const queryClient = useQueryClient();
//   useEffect(() => {
//     if (user?.firstName)
//       sendGTMEvent({
//         event: `Tailor Resume Page`,
//         value: `${user?.firstName} viewed Tailor Resume Page`,
//       });
//   }, [user?.firstName]);

//   const { data, status, isFetched } = useQuery(resumeQueries.detail(resumeId));
//   const resultsEndRef = useRef<HTMLDivElement>(null);
//   const hasGeneratedRef = useRef(false);
//   const router = useRouter();

//   const { streamData, streamStatus, startStream } = useResumeStream(
//     API_URL,
//     resumeId,
//   );

//   useEffect(() => {
//     if (!streamStatus.isComplete) {
//       resultsEndRef.current?.scrollIntoView({
//         behavior: "smooth",
//         block: "end",
//       });
//     }
//   }, [streamData]);

//   useEffect(() => {
//     if (isFetched && status === "success") {
//       if (user && jobDescription && !data && !hasGeneratedRef.current) {
//         hasGeneratedRef.current = true;
//         console.count("API CALLED");
//         toast.promise(startStream(user, jobDescription), {
//           loading: "Generating your tailored resume...",
//           success: () => {
//             return {
//               message: `Resume generation complete!`,
//             };
//           },
//           error: "Error",
//         });
//       }
//     }
//     if (aiApply && streamStatus.isComplete) {
//       router.push(
//         `/dashboard/preview?resumeId=${resumeId}&coverLetterId=${coverLetterId}&recruiterEmail=${recruiterEmail}&jobDescription=${jobDescription}`,
//       );
//     }
//   }, [
//     user,
//     jobDescription,
//     data,
//     status,
//     isFetched,
//     aiApply,
//     streamStatus.isComplete,
//   ]);

//   const shouldUseDbData = streamData.profile === "";

//   const handleCoverLetterDelete = async () => {
//     await api.delete(
//       `/delete-document/${resumeId}?docType=${COLLECTIONS.RESUME}`,
//     );
//     toast.success("Resume deleted successfully");
//     router.push("/dashboard/home");
//     await queryClient.invalidateQueries(resumeQueries.detail(resumeId));
//   };
//   return (
//     <div className="space-y-4 sm:space-y-8">
//       {aiApply && <ProgressIndicator activeStep={2} />}
//       <div className="flex w-full gap-3 items-center  p-4  bg-white justify-between">
//         <p className="text-xl font-medium font-inter">Tailored Resume</p>
//         <div className="flex gap-2">
//           <ResumeDownloadButton
//             resumeData={shouldUseDbData ? data! : streamData}
//           />
//           <Button
//             className=""
//             variant={"destructive"}
//             onClick={() => {
//               handleCoverLetterDelete();
//             }}
//           >
//             <TrashIcon className="w-5 h-5 " />
//           </Button>
//         </div>
//       </div>

//       <EditableResume
//         data={shouldUseDbData ? data! : streamData}
//         resumeId={resumeId}
//         isStreaming={!streamStatus.isComplete}
//       />
//       <div ref={resultsEndRef} className="" />
//     </div>
//   );
// };
