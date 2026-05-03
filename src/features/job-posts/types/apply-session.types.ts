// ─── Run log & active run (iframe-mode deck UI) ───────────────────────────────

export interface RunLogEntry {
  t: number;
  level: "info" | "action" | "thought" | "error" | "warn" | "debug";
  text: string;
}

/**
 * Full run state pushed from the extension background to the page.
 *
 * Used by useRunManager (deck view / iframe mode). Independent from
 * ApplySession — the deck view tracks runs here rather than in sessions.
 */
export interface RunBatchQuestion {
  id: string;
  question: string;
  field_label?: string;
  why?: string;
}

export interface ActiveRun {
  id: string;
  job?: { id: string; title: string; company: string; location?: string };
  /** The job application URL — used to recreate the iframe if missing. */
  jobUrl?: string;
  /** Raw status string from background.js: "loading" | "running" | "awaiting_user_input" |
   *  "awaiting_submit_approval" | "submitted" | "complete" | "stopped" | "blocked" | "error" */
  status: string;
  /** "iframe" = embedded in this page; "window" = off-screen popup */
  openMode?: "iframe" | "window";
  log?: RunLogEntry[];
  blockedMessage?: string;
  /** Agent is blocked waiting for user answers to these questions. */
  pendingBatch?: { questions: RunBatchQuestion[] } | null;
  /** Agent is ready to submit and waiting for user approval. */
  pendingSubmit?: { summary: string } | null;
  /** job_applications.id created after a successful submit — used to link to the details page. */
  applicationId?: string | null;
  /** True while we haven't yet received the real runId from background. */
  provisional?: boolean;
  dismissed?: boolean;
  createdAt?: number;
}

// ─── Strategy ─────────────────────────────────────────────────────────────────

/** The automation path chosen by the strategy router at click time. */
export type ApplyStrategy = "extension" | "cloud_bot" | "manual" | "email";

// ─── Status (unified FSM) ─────────────────────────────────────────────────────

/**
 * Every possible state across all apply strategies, collapsed into one type.
 *
 * Namespace prefixes:
 *   ext:   — Chrome extension hidden-tab automation
 *   cloud: — Browser-Use Cloud backend bot
 *   (none) — strategy-agnostic states (routing, terminal)
 *
 * State machine (happy path):
 *
 *   Extension:  routing → ext:queued → ext:navigating → ext:analyzing
 *               → ext:filling → [ext:reviewing] → applied
 *
 *   Cloud bot:  routing → cloud:starting → cloud:running
 *               → [cloud:paused → cloud:resuming] → applied
 *
 *   Manual:     routing → applied  (fire-and-forget tab open)
 *   Email:      routing → applied  (navigate to AI email compose)
 *
 * Fallback: ext:navigating --[form not found after all steps]-→ cloud:starting
 */
export type ApplyStatus =
  // Pre-routing: milliseconds between click and strategy selection
  | "routing"
  // ── Extension path (chrome-extension hidden-tab) ──────────────────────────
  | "ext:queued"     // dispatched to extension; awaiting tab-creation acknowledgement
  | "ext:navigating" // tab open; LLM agent navigating to the application form
  | "ext:analyzing"  // form found; Gemini generating answers + match score
  | "ext:filling"    // bot typing Gemini answers into form fields
  | "ext:reviewing"  // autoSubmit=false; user must confirm in sidepanel
  | "ext:stuck"      // form open but submit failed; needs human help
  // ── Cloud-bot path (browser-use cloud) ───────────────────────────────────
  | "cloud:starting"  // POST /submit-application in flight
  | "cloud:running"   // cloud session active; bot navigating + filling
  | "cloud:paused"    // awaiting_human: captcha / login / 2FA
  | "cloud:resuming"  // user hit "Resume"; bot re-entering the form
  // ── Terminal states (shared across all strategies) ────────────────────────
  | "applied"          // form submitted successfully
  | "failed"           // unrecoverable error (any strategy)
  | "skipped"          // below match threshold or user opted out
  | "recruiter_email"; // no public form; recruiter email discovered instead

/** Status values that close the apply session. A retry re-creates the session. */
export const TERMINAL_STATUSES = new Set<ApplyStatus>([
  "applied",
  "failed",
  "skipped",
  "recruiter_email",
]);

// ─── Session ──────────────────────────────────────────────────────────────────

/**
 * Unified per-job apply session.
 *
 * Single source of truth for every job row's apply UI — replaces the
 * previous split between BotSession (cloud) and ExtJobUpdate (extension).
 * The orchestrator owns one Map<jobId, ApplySession> and all rendering
 * derives from it.
 */
export interface ApplySession {
  jobId: string;
  strategy: ApplyStrategy;
  status: ApplyStatus;
  /**
   * UUID generated at click-time.
   * Flows through: window event → extension background → server POST body.
   * Enables end-to-end correlation in logs and fallback handoff.
   */
  correlationId: string;
  startedAt: number;
  /** Job metadata captured at click-time so the bell can show title/company. */
  jobTitle?: string;
  jobCompany?: string;

  // ── Cloud-bot fields (populated after POST /submit-application succeeds) ──
  applicationId?: string; // job_applications.id — needed for SSE + resume endpoint
  liveUrl?: string;       // Browser-Use Cloud live view URL

  // ── Progress detail ───────────────────────────────────────────────────────
  stuckReason?: string;
  lastStepSummary?: string;
  screenshotUrl?: string;

  // ── Terminal-state payload ────────────────────────────────────────────────
  applicationQA?: Array<{ question: string; answer: string }>;
  recruiterEmail?: string;
}
