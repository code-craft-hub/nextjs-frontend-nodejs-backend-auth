export interface IActiveUser {
  userId: string;
  lastSeenAt: string; // ISO-8601
  pagePath: string | null;
  ipAddress: string | null;
  // ── User core ────────────────────────────
  email: string;
  role: string;
  accountStatus: string;
  accountTier: string;
  // ── Profile ──────────────────────────────
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  photoUrl: string | null;
}

export interface IPresenceStats {
  /** Number of distinct users active within the server-side window. */
  activeCount: number;
  /** Duration of the active window in milliseconds (e.g. 300_000 = 5 min). */
  windowMs: number;
}
