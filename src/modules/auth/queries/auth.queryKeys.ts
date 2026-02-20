/**
 * Query key factory for auth-related queries.
 * Self-contained — no dependency on the global queryKeys registry.
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */
export const authQueryKeys = {
  all: ["auth"] as const,

  sessions: () => [...authQueryKeys.all, "session"] as const,
  session: () => [...authQueryKeys.sessions(), "current"] as const,

  profiles: () => [...authQueryKeys.all, "profile"] as const,
  profile: () => [...authQueryKeys.profiles(), "me"] as const,
};
